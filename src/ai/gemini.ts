import { GoogleGenAI, type Content } from "@google/genai";
import { EXAMPLES, MODEL, SYSTEM_PROMPT, wrapClaimProof } from "./prompt";
import {
  claimProofReviewJsonSchema,
  claimProofReviewSchema,
  type ClaimProofReview,
} from "../schemas/review";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env and Vercel.");
  }

  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

function buildContents(proof: string): Content[] {
  const examples: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrapClaimProof(example.proof) }] },
    { role: "model", parts: [{ text: JSON.stringify(example.review) }] },
  ]);

  return [
    ...examples,
    { role: "user", parts: [{ text: wrapClaimProof(proof) }] },
  ];
}

export class AiReplyError extends Error {}

export async function reviewClaimProof(
  proof: string,
): Promise<ClaimProofReview> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(proof),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: claimProofReviewJsonSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  const result = claimProofReviewSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema");
  }

  return result.data;
}
