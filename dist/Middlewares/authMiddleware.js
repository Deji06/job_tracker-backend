"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_1 = require("../utils/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, auth_1.verifyJWT)(token);
        req.user = { id: decoded.userId };
        next();
    }
    catch (error) {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};
exports.authMiddleware = authMiddleware;
