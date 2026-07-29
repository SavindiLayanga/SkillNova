import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { CVAnalysis } from './models/CVAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdminData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillNova');
    console.log('MongoDB connected for Admin Data Seeding...');

    // Users
    const dummyUsers = [
      { uid: 'admin_1', name: 'Super Admin', email: 'admin@skillnova.com', role: 'super_admin', username: 'admin', isActive: true },
      { uid: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'user', isActive: true, careerGoal: 'Frontend Developer', targetRole: 'React Developer' },
      { uid: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', isActive: true, careerGoal: 'Data Scientist', targetRole: 'Data Analyst' },
      { uid: 'user_3', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', isActive: true, careerGoal: 'Backend Developer', targetRole: 'Node.js Developer' },
      { uid: 'user_4', name: 'Bob Williams', email: 'bob@example.com', role: 'user', isActive: true, careerGoal: 'UI/UX Designer', targetRole: 'UI Engineer' },
      { uid: 'user_5', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', isActive: true, careerGoal: 'Full Stack', targetRole: 'Full Stack Developer' },
    ];

    // Clear existing users to avoid unique constraint issues with dummy data
    await User.deleteMany({ 
      $or: [
        { email: { $in: dummyUsers.map(u => u.email) } },
        { username: { $in: dummyUsers.filter(u => u.username).map(u => u.username) } }
      ] 
    });
    await User.insertMany(dummyUsers);
    console.log('Dummy Users added.');

    // CV Analyses
    const dummyCVs = [
      {
        userId: 'user_1',
        originalText: 'React developer with 2 years of experience',
        name: 'John Doe',
        email: 'john@example.com',
        cvScore: 85,
        targetRole: 'React Developer',
        matchPercentage: 90,
        skillMatchScore: 88,
        careerReadinessScore: 85,
        isActive: true
      },
      {
        userId: 'user_2',
        originalText: 'Data analyst familiar with Python, SQL, and pandas.',
        name: 'Jane Smith',
        email: 'jane@example.com',
        cvScore: 78,
        targetRole: 'Data Analyst',
        matchPercentage: 75,
        skillMatchScore: 80,
        careerReadinessScore: 78,
        isActive: true
      },
      {
        userId: 'user_3',
        originalText: 'Node.js developer looking for backend roles.',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        cvScore: 92,
        targetRole: 'Node.js Developer',
        matchPercentage: 95,
        skillMatchScore: 94,
        careerReadinessScore: 92,
        isActive: true
      }
    ];

    await CVAnalysis.deleteMany({ email: { $in: dummyCVs.map(c => c.email) } });
    await CVAnalysis.insertMany(dummyCVs);
    console.log('Dummy CV Analyses added.');

    mongoose.disconnect();
    console.log('Admin mock data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding admin data:', error);
    process.exit(1);
  }
};

seedAdminData();
