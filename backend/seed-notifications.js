import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AdminNotification } from './models/AdminNotification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const MONGODB_URI = process.env.MONGO_URI;

const dummyNotifications = [
  {
    title: "New User Registered",
    message: "Kasun Perera just registered as a student on the platform.",
    type: "info",
    isRead: false,
    link: "/admin/users"
  },
  {
    title: "Course Enrolled",
    message: "Nimali Silva enrolled in 'Advanced React Patterns'.",
    type: "success",
    isRead: false,
    link: "/admin/courses"
  },
  {
    title: "Quiz Completed",
    message: "15 users completed the JavaScript Basics quiz today.",
    type: "success",
    isRead: false,
    link: "/admin/dashboard"
  },
  {
    title: "System Update",
    message: "Platform successfully backed up at 2:00 AM.",
    type: "info",
    isRead: true,
  },
  {
    title: "User Logged In",
    message: "Admin session started from a new IP address.",
    type: "warning",
    isRead: false,
  }
];

async function seedNotifications() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    
    await AdminNotification.insertMany(dummyNotifications);
    console.log('Successfully added dummy notifications to Atlas!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications();
