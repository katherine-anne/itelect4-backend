export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing. Copy .env.example to .env and fill it in.",
    );
  }

  return secret;
}
