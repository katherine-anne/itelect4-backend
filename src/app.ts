import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { authRouter } from "./routes/auth";
import { aiRouter } from "./routes/ai";
import { claimRouter } from "./routes/claims";
import { itemRouter } from "./routes/items";

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      callback(null, origin === undefined || allowedOrigins.includes(origin));
    },
  }),
);
app.use(express.json());

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/items", itemRouter);
app.use("/api/auth", authRouter);
app.use("/api/claims", claimRouter);
app.use("/api/ai", aiRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((error) => error.message),
      });
      return;
    }

    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === 11000
    ) {
      res.status(409).json({ message: "That email is already registered" });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

export default app;
