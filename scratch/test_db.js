import mongoose from "mongoose";

const nonSrvUri = "mongodb://savindilayanga_db_user:SkillNova2026@ac-nbsvizz-shard-00-00.20zh83e.mongodb.net:27017,ac-nbsvizz-shard-00-01.20zh83e.mongodb.net:27017,ac-nbsvizz-shard-00-02.20zh83e.mongodb.net:27017/skillnova?replicaSet=atlas-102bug-shard-0&ssl=true&authSource=admin";

async function testConnection() {
  try {
    console.log("Connecting to MongoDB using standard (non-SRV) URI...");
    await mongoose.connect(nonSrvUri);
    console.log("✅ Successfully connected to MongoDB using standard URI!");
    await mongoose.connection.close();
    console.log("Connection closed.");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();
