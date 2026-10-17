import type { Item } from "../types/index";

export const itemFixtures: Omit<Item, "id">[] = [
  {
    itemName: "Black Wallet",
    description: "Contains school ID and cards",
    location: "Library",
    dateReported: new Date("2026-08-21T08:00:00.000Z"),
    status: "lost",
    ownerId: 1,
  },
  {
    itemName: "Pink Umbrella",
    description: "Automatic umbrella with a pink floral design",
    location: "Women's Restroom",
    dateReported: new Date("2026-08-21T08:30:00.000Z"),
    status: "lost",
    ownerId: 2,
  },
  {
    itemName: "Silver Water Bottle",
    description: "Stainless steel bottle with a blue cap",
    location: "Gymnasium",
    dateReported: new Date("2026-08-21T09:00:00.000Z"),
    status: "found",
    ownerId: 3,
  },
  {
    itemName: "Scientific Calculator",
    description: "Black Casio calculator with a name sticker at the back",
    location: "Engineering Building",
    dateReported: new Date("2026-08-21T09:30:00.000Z"),
    status: "claimed",
    ownerId: 4,
  },
];
