import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/Course.js';
import { connectDB } from './db.js';

dotenv.config();

const seedCourses = async () => {
  try {
    await connectDB();

    const demoCourses = [
      {
        title: "Advanced React Patterns & State Management",
        provider: "SkillNova Academy",
        category: "Programming",
        difficulty: "Advanced",
        duration: "15 Hours",
        language: "English",
        certificate: true,
        status: "Published",
        students: 3450,
        rating: 4.9,
        completionRate: 82,
        certificatesIssued: 2850,
        totalViews: 55000,
        skills: ["React", "JavaScript", "Frontend"],
        chartData: [
          { name: 'Jan', views: 5000, enrollments: 200 },
          { name: 'Feb', views: 6500, enrollments: 350 },
          { name: 'Mar', views: 8000, enrollments: 420 },
          { name: 'Apr', views: 7200, enrollments: 380 },
          { name: 'May', views: 9000, enrollments: 480 },
          { name: 'Jun', views: 11000, enrollments: 550 },
          { name: 'Jul', views: 13500, enrollments: 750 },
        ]
      },
      {
        title: "UI/UX Design Masterclass 2026",
        provider: "Coursera",
        category: "Design",
        difficulty: "Intermediate",
        duration: "20 Hours",
        language: "English",
        certificate: true,
        status: "Published",
        students: 1245,
        rating: 4.7,
        completionRate: 65,
        certificatesIssued: 800,
        totalViews: 25000,
        skills: ["Figma", "UI Design", "UX Research"],
        chartData: [
          { name: 'Jan', views: 2000, enrollments: 100 },
          { name: 'Feb', views: 2500, enrollments: 150 },
          { name: 'Mar', views: 3200, enrollments: 180 },
          { name: 'Apr', views: 4000, enrollments: 220 },
          { name: 'May', views: 3800, enrollments: 200 },
          { name: 'Jun', views: 4500, enrollments: 280 },
          { name: 'Jul', views: 5000, enrollments: 315 },
        ]
      }
    ];

    await Course.insertMany(demoCourses);
    console.log('✅ Demo courses with analytics data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedCourses();
