// types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    export interface Request {
      user?: { id: number };
    }
  }
}
