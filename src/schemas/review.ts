import { z } from "zod";

export const claimProofRequestSchema = z.object({
  proof: z
    .string()
    .trim()
    .min(20, "Explain your ownership proof in at least 20 characters.")
    .max(2000, "Keep your proof explanation under 2000 characters."),
});

export const claimProofReviewSchema = z.object({
  summary: z
    .string()
    .describe("One short sentence about how clear the explanation is."),
  helpfulDetails: z
    .array(z.string())
    .max(3)
    .describe(
      "Specific identifying details already included that may help a human reviewer.",
    ),
  suggestions: z
    .array(z.string())
    .max(3)
    .describe(
      "Accurate, non-sensitive details the claimant could add if they are true.",
    ),
});

export type ClaimProofReview = z.infer<typeof claimProofReviewSchema>;

export const claimProofReviewJsonSchema = z.toJSONSchema(claimProofReviewSchema);
