import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Atlas Connected");
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error.message);
    try {
      console.log("🔄 Attempting to connect to local MongoDB (mongodb://localhost:27017/skillnova)...");
      await mongoose.connect("mongodb://localhost:27017/skillnova", {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ Local MongoDB Connected successfully as fallback!");
    } catch (localErr) {
      console.error("❌ Local MongoDB connection failed:", localErr.message);
    }
  }
};
