import "dotenv/config";
import { reviewProject } from "./ai/gemini";

async function tryAi(): Promise<void> {
  const review = await reviewProject(
    "The Campus Lost & Found Tracker is a React and TypeScript app where " +
      "students browse lost and found items and submit claims with proof. " +
      "A security admin reviews claims. Its API uses Express, MongoDB, and JWT, " +
      "and both repositories have live Vercel deployments.",
  );

  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((error: unknown) => {
  console.error("Gemini call failed:", error);
  process.exit(1);
});
