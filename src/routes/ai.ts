import { ApiError } from "@google/genai";
import { rateLimit } from "express-rate-limit";
import { Router, type Request, type Response } from "express";
import { AiReplyError, reviewProject } from "../ai/gemini";
import { requireAuth } from "../middleware/auth";
import { aiRequestSchema } from "../schemas/review";

export const aiRouter = Router();

// Authentication runs first so each student's allowance is independent.
aiRouter.use(requireAuth);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req: Request) => req.userId!,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Five reviews a minute is the limit. Try again shortly.",
  },
});

aiRouter.use(aiLimiter);

aiRouter.post("/", async (req: Request, res: Response) => {
  const parsed = aiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((issue) => issue.message),
    });
    return;
  }

  try {
    const review = await reviewProject(parsed.data.prompt);
    res.json(review);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      res.status(429).json({
        message: "The AI quota is used up for now. Try again later.",
      });
      return;
    }

    if (error instanceof ApiError || error instanceof AiReplyError) {
      console.error(error);
      res.status(502).json({
        message: "The AI service did not answer properly. Try again.",
      });
      return;
    }

    // Missing configuration and application bugs remain 500s handled by app.ts.
    throw error;
  }
});
