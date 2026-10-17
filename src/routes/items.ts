import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { ItemModel } from "../models/Item";

export const itemRouter = Router();

itemRouter.get("/", async (_req: Request, res: Response) => {
  const items = await ItemModel.find().sort({ dateReported: -1 });
  res.json(items);
});

itemRouter.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: `"${req.params.id}" is not a valid id` });
    return;
  }

  const item = await ItemModel.findById(req.params.id);
  if (!item) {
    res.status(404).json({ message: "No item with that id" });
    return;
  }

  res.json(item);
});
