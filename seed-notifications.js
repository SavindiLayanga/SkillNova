import mongoose from 'mongoose';
import { AdminNotification } from './backend/models/AdminNotification.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/skillnova'; // Assuming default local MongoDB

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
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await AdminNotification.insertMany(dummyNotifications);
    console.log('Successfully added dummy notifications!');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications();
