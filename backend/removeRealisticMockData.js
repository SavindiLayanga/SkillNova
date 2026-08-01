import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from './models/User.js';
import { CVAnalysis } from './models/CVAnalysis.js';
import { LearningPath } from './models/LearningPath.js';
import { SkillTest } from './models/SkillTest.js';
import { LibraryTest } from './models/LibraryTest.js';
import { ManualAnalysis } from './models/ManualAnalysis.js';
import { PracticeSession } from './models/PracticeSession.js';
import { UserSettings } from './models/UserSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const mockDomain = '@skillnovamock.com';

async function removeMockData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected. Removing realistic mock data...');

    // Find the mock user IDs
    const mockUsers = await User.find({ email: { $regex: mockDomain } });
    const mockUserIds = mockUsers.map(u => u.uid);

    console.log(`Found ${mockUserIds.length} mock users to remove.`);

    if (mockUserIds.length > 0) {
      await User.deleteMany({ uid: { $in: mockUserIds } });
      await CVAnalysis.deleteMany({ userId: { $in: mockUserIds } });
      await ManualAnalysis.deleteMany({ userId: { $in: mockUserIds } });
      await LearningPath.deleteMany({ userId: { $in: mockUserIds } });
      await SkillTest.deleteMany({ userId: { $in: mockUserIds } });
      await LibraryTest.deleteMany({ userId: { $in: mockUserIds } });
      await PracticeSession.deleteMany({ userId: { $in: mockUserIds } });
      await UserSettings.deleteMany({ userId: { $in: mockUserIds } });
      console.log('Mock user data completely removed.');
    } else {
      console.log('No mock users found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error removing mock data:', error);
    process.exit(1);
  }
}

removeMockData();
