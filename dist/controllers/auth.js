"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../generated/prisma");
const errors_1 = require("../errors");
const auth_1 = require("../utils/auth");
const validation_1 = require("../utils/validation");
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma = new prisma_1.PrismaClient();
const router = (0, express_1.Router)();
dotenv_1.default.config();
// REGISTERATION
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = validation_1.registerationSchema.parse(req.body);
        if (!email || !name || !password) {
            throw new errors_1.BadRequestError('provide all credentials');
        }
        await prisma.$connect();
        console.log('Prisma connected to Supabase');
        // checking if user already exist
        const checkExistingUsers = await prisma.user.findUnique({ where: { email } });
        if (checkExistingUsers) {
            throw new errors_1.BadRequestError('User already exists');
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        res.status(201).json({ id: user.id, email: user.email, name: user.name });
    }
    catch (error) {
        next(error);
    }
});
// LOGIN
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = validation_1.loginSchema.parse(req.body);
        if (!email || !password) {
            throw new errors_1.BadRequestError('provide valid credentials');
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new errors_1.BadRequestError('account does not exist, check credentials or create an account');
        }
        const isPasswordMatch = await (0, auth_1.comparePassword)(password, user.password);
        if (!isPasswordMatch) {
            throw new errors_1.BadRequestError('password does not match');
        }
        const token = (0, auth_1.createJWT)({ userId: user.id });
        res.status(200).json({
            id: user.id,
            msg: 'login successful',
            name: user.name,
            token
        });
    }
    catch (error) {
        next(error);
    }
});
// FOREGT PASSSWORD
router.post('/forget_password', async (req, res, next) => {
    try {
        const { email } = validation_1.forget_password_Schema.parse(req.body);
        if (!email) {
            throw new errors_1.BadRequestError('provide email address');
        }
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new errors_1.BadRequestError('user does not exist');
        }
        const resetPasswordToken = crypto_1.default.randomBytes(32).toString('hex');
        const Tokenexpiry = new Date(Date.now() + 1000 * 60 * 15);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: resetPasswordToken,
                tokenExpiry: Tokenexpiry,
            },
        });
        const resetLink = `http://localhost:3000/reset_password?token=${resetPasswordToken}&id=${user.id}`;
        //  nodemailer implementation
        const transporter = nodemailer_1.default.createTransport({
            // service: "gmail", 
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
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
        res.status(200).json({ msg: 'password reset link sent to your email addy' });
    }
    catch (error) {
        console.error("Error in forget_password:", error);
        next(error);
    }
});
// RESET PASSWORD
router.post("/reset_password", async (req, res, next) => {
    try {
        // validate request
        const { token, newPassword } = validation_1.resetPasswordSchema.parse(req.body);
        // find user
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                tokenExpiry: { gte: new Date() } // ensure not expired
            },
        });
        if (!user || !user.resetToken || !user.tokenExpiry) {
            throw new errors_1.BadRequestError("Invalid or expired reset request");
        }
        // check token and expiry
        if (user.resetToken !== token || user.tokenExpiry < new Date()) {
            throw new errors_1.BadRequestError("Invalid or expired reset token");
        }
        // hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
