import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ensureAdminUser = async () => {
  try {
    const admin = await mongoose.connection.collection('users').findOne({
      $or: [{ username: 'admin' }, { email: 'admin@skillnova.com' }]
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await mongoose.connection.collection('users').insertOne({
        uid: 'admin_1',
        name: 'Super Admin',
        email: 'admin@skillnova.com',
        username: 'admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("🛡️ Default Admin user ensured in database.");
    }
  } catch (err) {
    console.warn("Could not check/ensure admin user:", err.message);
  }
};

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("✅ MongoDB Atlas Connected");
    await ensureAdminUser();
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error.message);
    try {
      console.log("🔄 Attempting to connect to local MongoDB (mongodb://localhost:27017/skillnova)...");
      await mongoose.connect("mongodb://localhost:27017/skillnova", {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✅ Local MongoDB Connected successfully as fallback!");
      await ensureAdminUser();
    } catch (localErr) {
      console.error("❌ Local MongoDB connection failed:", localErr.message);
    }
  }
};
