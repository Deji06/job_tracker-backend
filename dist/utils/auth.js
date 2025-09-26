"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.createJWT = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
}
const hashPassword = async (password) => {
    return await bcryptjs_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
// Comparing users password and hashed version of it
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
// GENERATE TOKEN
const createJWT = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "1d" }); // 1 day expiry
};
exports.createJWT = createJWT;
// Verify JWT (used in middleware)
const verifyJWT = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyJWT = verifyJWT;
