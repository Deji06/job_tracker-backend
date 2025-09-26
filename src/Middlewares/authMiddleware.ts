import { Request, Response, NextFunction } from "express";
import {verifyJWT} from '../utils/auth'
import dotenv from 'dotenv'
dotenv.config()

interface jwtPayload {
    userId: number
}

export interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export const authMiddleware = (req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = verifyJWT(token) as jwtPayload
        req.user = {id: decoded.userId}
        next()
        
    } catch (error) {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
}