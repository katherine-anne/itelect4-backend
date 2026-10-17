import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { ItemModel } from "../models/Item";
import { itemFixtures } from "./itemFixtures";

async function main(): Promise<void> {
  await connectDB();

  try {
    if ((await ItemModel.countDocuments()) > 0) {
      console.log("Items already exist; no seed data was written.");
      return;
    }

    const items = await ItemModel.insertMany(itemFixtures);
    console.log(`Seeded ${items.length} items:`);
    for (const item of items) {
      console.log(`${item.itemName}: ${item._id.toString()}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error("Could not seed items:", error);
  process.exitCode = 1;
});
