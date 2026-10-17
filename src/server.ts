import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";
import { getJwtSecret } from "./config/jwt";

const port = Number(process.env.PORT) || 4000;

// Validate the JWT secret before accepting local requests.
getJwtSecret();

void connectDB().catch((error: unknown) => {
  console.error("Could not connect to MongoDB:", error);
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
