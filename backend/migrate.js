import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const collectionsToRename = {
  'adminnotifications': 'admin_notifications',
  'courses': 'admin_courses',
  'jobs': 'admin_jobs',
  'users': 'user_profiles',
  'cvanalyses': 'user_cvanalyses',
  'manualanalyses': 'user_manualanalyses',
  'skilltests': 'user_skilltests',
  'librarytests': 'user_librarytests',
  'practicesessions': 'user_practicesessions',
  'learningpaths': 'user_learningpaths',
  'usersettings': 'user_settings'
};

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;

    // Get all existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    for (const [oldName, newName] of Object.entries(collectionsToRename)) {
      if (collectionNames.includes(oldName)) {
        console.log(`Migrating data from '${oldName}' to '${newName}'...`);
        
        // If the new collection already exists (auto-created by mongoose), drop it first
        if (collectionNames.includes(newName)) {
          console.log(`Target collection '${newName}' already exists. Dropping it first...`);
          await db.collection(newName).drop();
        }

        // Rename the old collection to the new collection
        await db.collection(oldName).rename(newName);
        console.log(`✅ Successfully renamed '${oldName}' to '${newName}'`);
      } else {
        console.log(`⚠️ Old collection '${oldName}' not found. Skipping...`);
      }
    }

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

migrate();
