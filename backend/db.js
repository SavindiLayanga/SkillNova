import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB Atlas Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:");
    console.error(error.message);
    process.exit(1);
  }
}