import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt";
import { UserModel } from "../models/User";
import type { UserRole } from "../types/index";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return Promise.resolve();
  }

  const token = header.slice("Bearer ".length);
  let userId: string;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string"
    ) {
      throw new Error("Token payload is missing userId");
    }
    userId = decoded.userId;
  } catch {
    res.status(401).json({ message: "Token is invalid or has expired" });
    return Promise.resolve();
  }

  return UserModel.findById(userId)
    .select("role isActive")
    .then((user) => {
      if (!user || !user.isActive) {
        res.status(401).json({ message: "Token is invalid or has expired" });
        return;
      }

      req.userId = String(user._id);
      req.userRole = user.role;
      next();
    })
    .catch(next);
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole !== role) {
      res.status(403).json({ message: "You do not have permission to do this" });
      return;
    }

    next();
  };
}
