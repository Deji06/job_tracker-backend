import {z} from 'zod'

export const registerationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forget_password_Schema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});