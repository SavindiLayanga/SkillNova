import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { LibraryTest } from './models/LibraryTest.js';
import { SkillTest } from './models/SkillTest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Delete library tests with generic old mock titles or descriptions
    let libRes = await LibraryTest.deleteMany({ title: /Mock Test/i });
    console.log(`Deleted ${libRes.deletedCount} old library mock tests by title.`);

    let libRes2 = await LibraryTest.deleteMany({ description: /rate limit/i });
    console.log(`Deleted ${libRes2.deletedCount} old library tests by description.`);
    
    let libRes3 = await LibraryTest.deleteMany({ title: /Extended Concepts/i });
    console.log(`Deleted ${libRes3.deletedCount} old library tests by Extended Concepts title.`);

    // Just in case, clean up any generic SkillTests
    let skillRes = await SkillTest.deleteMany({ topic: /Mock Test/i });
    console.log(`Deleted ${skillRes.deletedCount} old skill tests.`);

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

run();
