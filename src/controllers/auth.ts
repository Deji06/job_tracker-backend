import { Request, Response , NextFunction,  Router} from "express";
import { PrismaClient } from "../../generated/prisma";
import { BadRequestError } from "../errors";
import { comparePassword, createJWT, hashPassword } from "../utils/auth";
import { AuthenticatedRequest } from "../Middlewares/authMiddleware";
import { registerationSchema , loginSchema, forget_password_Schema, resetPasswordSchema} from "../utils/validation";
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

const prisma = new PrismaClient()
const router = Router()
dotenv.config()

// REGISTERATION
router.post('/register', async(req:Request, res: Response, next:NextFunction) => {
    try {
        const {name, email, password} = registerationSchema.parse(req.body)
        if (!email || !name || !password) {
            throw new BadRequestError('provide all credentials')
        }
        await prisma.$connect();
        console.log('Prisma connected to Supabase');
        // checking if user already exist
        const checkExistingUsers = await prisma.user.findUnique({where: {email}})
        if (checkExistingUsers) {
            throw new BadRequestError('User already exists')
        }
        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
            data: {name, email, password:hashedPassword},
            select: { id: true, name: true, email: true, createdAt: true },
        })
        res.status(201).json({id: user.id, email:user.email, name:user.name})
        
    } catch (error) {
        next(error)
    }

})

// LOGIN
router.post('/login', async (req:Request, res: Response, next:NextFunction) => {
    try {
        const {email, password} = loginSchema.parse(req.body)
        if(!email || !password) {
            throw new BadRequestError('provide valid credentials')
        }
        const user = await prisma.user.findUnique({where:{email}})
        if(!user) {
            throw new BadRequestError('account does not exist, check credentials or create an account')
        }
        const isPasswordMatch = await comparePassword(password, user.password)
        if(!isPasswordMatch) {
            throw new BadRequestError('password does not match')
        }
        const token = createJWT({userId: user.id})
        res.status(200).json({
            id:user.id,
            msg: 'login successful',
            name:user.name,
            token
        })
    } catch (error) {
        next(error)
    }

})

// FOREGT PASSSWORD
router.post('/forget_password', async(req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    try {
        const {email} = forget_password_Schema.parse(req.body)
        if(!email) {
            throw new BadRequestError('provide email address')
        }
        const user = await prisma.user.findUnique({
            where: {email}
        })

        if(!user) {
            throw new BadRequestError('user does not exist')
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex')
        const Tokenexpiry = new Date(Date.now() + 1000 * 60 * 15); 

        await prisma.user.update({
            where:{id:user.id},
            data: {
                resetToken: resetPasswordToken,
                tokenExpiry: Tokenexpiry,

            },
        })
         const resetLink = `http://localhost:3000/reset_password?token=${resetPasswordToken}&id=${user.id}`;

        //  nodemailer implementation
        const transporter = nodemailer.createTransport({
            // service: "gmail", 
            host: "smtp.gmail.com",
            port:587,
            secure:false,
            auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
            },
        });

        // Verify SMTP connection
    await transporter.verify().catch((err) => {
      console.error("SMTP verification failed:", err);
      throw new Error(`SMTP connection failed: ${err.message}`);
    });

        await transporter.sendMail({
            from: `"Job Tracker" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
            <p>Hello ${user.name},</p>
            <p>You requested a password reset. Click below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link expires in 15 minutes.</p>
            `,
        });
        console.log(`Password reset email sent to ${user.email}`);
        res.status(200).json({msg:'password reset link sent to your email addy'})
    } catch (error) {
        console.error("Error in forget_password:", error);
        next(error)
    }
})

// RESET PASSWORD
router.post("/reset_password", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // validate request
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      // find user
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            tokenExpiry: { gte: new Date() } // ensure not expired
        },
    });

      if (!user || !user.resetToken || !user.tokenExpiry) {
        throw new BadRequestError("Invalid or expired reset request");
      }

      // check token and expiry
      if (user.resetToken !== token || user.tokenExpiry < new Date()) {
        throw new BadRequestError("Invalid or expired reset token");
      }

      // hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // update user with new password + clear reset fields
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          tokenExpiry: null,
        },
      });

      return res.status(200).json({ msg: "Password reset successful!" });
    } catch (error) {
      next(error);
    }
  }
);

export default router