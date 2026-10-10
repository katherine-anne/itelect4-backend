import { model, Schema } from "mongoose";
import type { ItemDoc } from "../types/index";

const itemSchema = new Schema<ItemDoc>({
  itemName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  dateReported: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["lost", "found", "claimed"],
    required: true,
  },
  // Keep the frontend's existing owner ID shape until Session 11 integration.
  ownerId: { type: Number, required: true },
});

itemSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ItemModel = model<ItemDoc>("Item", itemSchema);
