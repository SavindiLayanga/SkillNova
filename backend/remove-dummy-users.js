import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { CVAnalysis } from './models/CVAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const dummyEmails = [
      'john@example.com',
      'jane@example.com',
      'alice@example.com',
      'bob@example.com',
      'charlie@example.com'
    ];

    const deletedUsers = await User.deleteMany({ email: { $in: dummyEmails } });
    const deletedCVs = await CVAnalysis.deleteMany({ email: { $in: dummyEmails } });

    console.log(`Deleted Dummy Users: ${deletedUsers.deletedCount}`);
    console.log(`Deleted Dummy CV Analyses: ${deletedCVs.deletedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
