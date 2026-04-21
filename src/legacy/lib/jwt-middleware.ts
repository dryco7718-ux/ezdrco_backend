import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role?: string };
    }
  }
}

export function jwtPopulate(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return next();
    const token = auth.slice(7).trim();
    const secret = process.env.JWT_SECRET || "dev-jwt-secret";
    const payload = jwt.verify(token, secret) as any;
    if (payload && payload.sub) {
      req.auth = { userId: String(payload.sub), role: payload.role };
    }
  } catch (e) {
    // Ignore verification errors here; routes may still choose to reject.
  }
  return next();
}
