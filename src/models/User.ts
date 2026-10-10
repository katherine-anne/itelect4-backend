import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import type { UserDoc } from "../types/index";

const userSchema = new Schema<UserDoc>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["student", "securityAdmin"],
    default: "student",
  },
  isActive: { type: Boolean, default: true },
  password: { type: String, required: true, minlength: 8, select: false },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const UserModel = model<UserDoc>("User", userSchema);
