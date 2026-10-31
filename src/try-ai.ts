import "dotenv/config";
import { reviewClaimProof } from "./ai/gemini";

async function tryAi(): Promise<void> {
  const review = await reviewClaimProof(
    "I believe the black backpack is mine because it has a red patch on the " +
      "front and a small tear near the right strap. I last had it in the " +
      "library yesterday afternoon.",
  );

  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((error: unknown) => {
  console.error("Gemini call failed:", error);
  process.exit(1);
});
