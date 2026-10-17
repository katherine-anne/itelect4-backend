import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { ClaimModel } from "../models/Claim";
import { ItemModel } from "../models/Item";
import { requireAuth, requireRole } from "../middleware/auth";
import type {
  ClaimDecisionBody,
  ClaimUpdateBody,
  NewClaimBody,
} from "../types/index";

export const claimRouter = Router();
claimRouter.use(requireAuth);

interface IdParam extends Record<string, string> {
  id: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getClaimantId(
  req: { userId?: string },
  res: Response,
): string | undefined {
  if (!req.userId) {
    res.status(401).json({ message: "Token is invalid or has expired" });
    return undefined;
  }
  return req.userId;
}

async function itemExists(itemId: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(itemId)) return false;
  return (await ItemModel.exists({ _id: itemId })) !== null;
}

claimRouter.get("/", async (req: Request, res: Response) => {
  const claimantId = getClaimantId(req, res);
  if (!claimantId) return;

  const filter = req.userRole === "securityAdmin" ? {} : { claimantId };
  const claims = await ClaimModel.find(filter).sort({ claimDate: -1 });
  res.json(claims);
});

claimRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const claimantId = getClaimantId(req, res);
    if (!claimantId) return;

    const claim = await ClaimModel.findOne({
      _id: req.params.id,
      claimantId,
    });

    if (!claim) {
      res.status(404).json({ message: "No claim with that id" });
      return;
    }

    res.json(claim);
  },
);

claimRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewClaimBody>,
    res: Response,
  ) => {
    const claimantId = getClaimantId(req, res);
    if (!claimantId) return;

    if (!isRecord(req.body)) {
      res.status(400).json({ message: "A JSON request body is required" });
      return;
    }

    const { itemId, proof } = req.body;
    if (typeof itemId !== "string" || typeof proof !== "string") {
      res.status(400).json({ message: "itemId and proof are required" });
      return;
    }

    if (!(await itemExists(itemId))) {
      res.status(400).json({
        message: "itemId must reference an existing item",
      });
      return;
    }

    // Explicitly select writable fields; never trust body claimantId or status.
    const claim = await ClaimModel.create({
      itemId,
      proof,
      claimantId,
      status: "pending",
    });

    res.status(201).json(claim);
  },
);

claimRouter.patch(
  "/:id/status",
  requireRole("securityAdmin"),
  async (
    req: Request<IdParam, unknown, ClaimDecisionBody>,
    res: Response,
  ) => {
    if (!isRecord(req.body)) {
      res.status(400).json({ message: "A JSON request body is required" });
      return;
    }

    const { status } = req.body;
    if (status !== "approved" && status !== "rejected") {
      res.status(400).json({
        message: "status must be approved or rejected",
      });
      return;
    }

    const claim = await ClaimModel.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      { status },
      { returnDocument: "after", runValidators: true },
    );

    if (!claim) {
      const exists = await ClaimModel.exists({ _id: req.params.id });
      res
        .status(exists ? 409 : 404)
        .json({
          message: exists
            ? "Only pending claims can be decided"
            : "No claim with that id",
        });
      return;
    }

    res.json(claim);
  },
);

claimRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, ClaimUpdateBody>,
    res: Response,
  ) => {
    const claimantId = getClaimantId(req, res);
    if (!claimantId) return;

    if (!isRecord(req.body)) {
      res.status(400).json({ message: "A JSON request body is required" });
      return;
    }

    const updates: ClaimUpdateBody = {};
    if (Object.hasOwn(req.body, "itemId")) {
      if (typeof req.body.itemId !== "string") {
        res.status(400).json({ message: "itemId must be a string" });
        return;
      }
      if (!(await itemExists(req.body.itemId))) {
        res.status(400).json({
          message: "itemId must reference an existing item",
        });
        return;
      }
      updates.itemId = req.body.itemId;
    }

    if (Object.hasOwn(req.body, "proof")) {
      if (typeof req.body.proof !== "string") {
        res.status(400).json({ message: "proof must be a string" });
        return;
      }
      updates.proof = req.body.proof;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Provide itemId or proof to update" });
      return;
    }

    const claim = await ClaimModel.findOneAndUpdate(
      { _id: req.params.id, claimantId },
      updates,
      { returnDocument: "after", runValidators: true },
    );

    if (!claim) {
      res.status(404).json({ message: "No claim with that id" });
      return;
    }

    res.json(claim);
  },
);

claimRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const claimantId = getClaimantId(req, res);
    if (!claimantId) return;

    const claim = await ClaimModel.findOneAndDelete({
      _id: req.params.id,
      claimantId,
    });

    if (!claim) {
      res.status(404).json({ message: "No claim with that id" });
      return;
    }

    res.status(204).send();
  },
);
