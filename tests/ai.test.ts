import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app";
import { UserModel } from "../src/models/User";

vi.mock("../src/config/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/models/User", () => ({
  UserModel: { findById: vi.fn() },
}));

const findById = vi.mocked(UserModel.findById);

function tokenFor(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set for the valid-token test.");
  }

  return jwt.sign({ userId }, secret, { expiresIn: "5m" });
}

function authorizeActiveStudent(): void {
  const activeStudent = {
    _id: "test-user-id",
    role: "student",
    isActive: true,
  };
  const select = vi.fn().mockResolvedValue(activeStudent);

  findById.mockReturnValue(
    { select } as unknown as ReturnType<typeof UserModel.findById>,
  );
}

describe("POST /api/ai", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("answers 401 when there is no token", async () => {
    const response = await request(app)
      .post("/api/ai")
      .send({ proof: "My black backpack has a red patch on the front." });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "No token. Send Authorization: Bearer <token>",
    );
    expect(findById).not.toHaveBeenCalled();
  });

  it("answers 401 when the token was signed with another secret", async () => {
    const forged = jwt.sign({ userId: "test-user-id" }, "wrong-test-secret");
    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${forged}`)
      .send({ proof: "My black backpack has a red patch on the front." });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token is invalid or has expired");
    expect(findById).not.toHaveBeenCalled();
  });

  it("lets an active user's valid token through before validating the body", async () => {
    authorizeActiveStudent();

    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${tokenFor("test-user-id")}`)
      .send({ proof: "Too short" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual([
      "Explain your ownership proof in at least 20 characters.",
    ]);
    expect(findById).toHaveBeenCalledWith("test-user-id");
  });
});
