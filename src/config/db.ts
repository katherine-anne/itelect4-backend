import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((connected) => {
        console.log("MongoDB connected:", connected.connection.name);
        return connected;
      })
      .catch((error: unknown) => {
        connection = null;
        throw error;
      });
  }

  return connection;
}
