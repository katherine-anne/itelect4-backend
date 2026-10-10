import { model, Schema } from "mongoose";
import type { ClaimDoc } from "../types/index";

const claimSchema = new Schema<ClaimDoc>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  claimantId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  claimDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["approved", "rejected"],
    default: "approved",
    required: true,
  },
  proof: {
    type: String,
    required: [true, "Proof of ownership is required"],
    trim: true,
    minlength: [5, "Proof of ownership must be at least 5 characters"],
  },
});

claimSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ClaimModel = model<ClaimDoc>("Claim", claimSchema);
