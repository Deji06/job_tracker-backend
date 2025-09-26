import bcrypt from 'bcryptjs'
import  jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Comparing users password and hashed version of it
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// GENERATE TOKEN
export const createJWT = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" }); // 1 day expiry
};

// Verify JWT (used in middleware)
export const verifyJWT = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};