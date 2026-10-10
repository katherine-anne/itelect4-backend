import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { ItemModel } from "../models/Item";
import type { Item } from "../types/index";

interface ItemFixture {
  id: string;
  itemName: string;
  description: string;
  location: string;
  dateReported: string;
  status: Item["status"];
  ownerId: number;
}

interface ProjectFixture {
  items: ItemFixture[];
}

async function main(): Promise<void> {
  await connectDB();

  try {
    if ((await ItemModel.countDocuments()) > 0) {
      console.log("Items already exist; no seed data was written.");
      return;
    }

    const fixturePath = resolve(process.cwd(), "../itelect4-project/db.json");
    const fixture = JSON.parse(
      await readFile(fixturePath, "utf8"),
    ) as ProjectFixture;

    const items = await ItemModel.insertMany(
      fixture.items.map((item) => ({
        itemName: item.itemName,
        description: item.description,
        location: item.location,
        dateReported: new Date(item.dateReported),
        status: item.status,
        ownerId: item.ownerId,
      })),
    );

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
