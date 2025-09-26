"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forget_password_Schema = exports.loginSchema = exports.registerationSchema = void 0;
const zod_1 = require("zod");
exports.registerationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.forget_password_Schema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
