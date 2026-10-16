import type { Types } from "mongoose";

// The application-domain interfaces from the frontend project.
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "securityAdmin";
  isActive: boolean;
}

export interface Item {
  id: string;
  itemName: string;
  description: string;
  location: string;
  dateReported: Date;
  status: "lost" | "found" | "claimed";
  ownerId: number;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  claimDate: Date;
  status: "approved" | "rejected";
  proof: string;
}

// MongoDB supplies document IDs. Claim references use MongoDB ObjectIds.
export type UserDoc = Omit<User, "id"> & { password: string };
export type ItemDoc = Omit<Item, "id">;
export type ClaimDoc = Omit<Claim, "id" | "itemId" | "claimantId"> & {
  itemId: Types.ObjectId;
  claimantId: Types.ObjectId;
};

// Clients may choose an item and provide proof, but never choose the claimant
// or the decision status.
export interface NewClaimBody {
  itemId: string;
  proof: string;
}

export type ClaimUpdateBody = Partial<NewClaimBody>;

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
}
