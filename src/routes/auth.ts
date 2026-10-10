import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt";
import { UserModel } from "../models/User";
import type { LoginBody, RegisterBody, TokenPayload } from "../types/index";

export const authRouter = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

authRouter.post(
  "/register",
  async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
    if (!isRecord(req.body)) {
      res.status(400).json({ message: "A JSON request body is required" });
      return;
    }

    const { name, email, password } = req.body;
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await UserModel.findOne({ email: normalizedEmail })) {
      res.status(409).json({ message: "That email is already registered" });
      return;
    }

    // Role is intentionally omitted: public registration always creates a student.
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    res.status(201).json(user.toJSON());
  },
);

authRouter.post(
  "/login",
  async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
    if (!isRecord(req.body)) {
      res.status(400).json({ message: "A JSON request body is required" });
      return;
    }

    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Email or password is incorrect" });
      return;
    }

    const payload: TokenPayload = { userId: String(user._id) };
    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: "2h" });

    res.json({ token, user: user.toJSON() });
  },
);
