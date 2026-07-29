import { User } from '../models/User.js';
import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';
import { LibraryTest } from '../models/LibraryTest.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCVUploads,
      totalJobs,
      totalCourses,
      totalSkills,
      recentUsers,
      recentCVs,
      pendingCVs,
      reviewedCVs,
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isDeleted: false }),
      CVAnalysis.countDocuments(),
      Job.countDocuments({ status: { $ne: 'deleted' } }),
      Course.countDocuments(),
      LibraryTest.countDocuments(),
      User.find({ role: 'user', isDeleted: false }).sort({ createdAt: -1 }).limit(2).lean(),
      CVAnalysis.find().sort({ createdAt: -1 }).limit(2).lean(),
      CVAnalysis.countDocuments({ score: { $exists: false } }), // assuming pending means no score
      CVAnalysis.countDocuments({ score: { $exists: true } }),
    ]);

    const stats = [
      { label: "Total Users", value: totalUsers, change: "Live from DB" },
      { label: "Total CV Uploads", value: totalCVUploads, change: "Live from DB" },
      { label: "Total Jobs", value: totalJobs, change: "Live from DB" },
      { label: "Total Courses", value: totalCourses, change: "Live from DB" },
      { label: "Total Skills", value: totalSkills, change: "Live from DB" }
    ];

    const recentActivity = [
      ...recentUsers.map(u => `${u.name || 'A user'} joined the platform.`),
      ...recentCVs.map(cv => `${cv.name || 'A user'} uploaded a CV for analysis.`)
    ];

    const chartData = {
      weekly: [
        { name: 'Mon', 'CV Uploads': Math.floor(totalCVUploads/7), 'Progress Tracking': Math.floor(totalUsers/7) },
        { name: 'Tue', 'CV Uploads': Math.floor(totalCVUploads/6), 'Progress Tracking': Math.floor(totalUsers/6) },
        { name: 'Wed', 'CV Uploads': Math.floor(totalCVUploads/5), 'Progress Tracking': Math.floor(totalUsers/5) },
        { name: 'Thu', 'CV Uploads': Math.floor(totalCVUploads/4), 'Progress Tracking': Math.floor(totalUsers/4) },
        { name: 'Fri', 'CV Uploads': Math.floor(totalCVUploads/3), 'Progress Tracking': Math.floor(totalUsers/3) },
        { name: 'Sat', 'CV Uploads': Math.floor(totalCVUploads/2), 'Progress Tracking': Math.floor(totalUsers/2) },
        { name: 'Sun', 'CV Uploads': totalCVUploads, 'Progress Tracking': totalUsers },
      ],
      monthly: [
        { name: 'Week 1', 'CV Uploads': Math.floor(totalCVUploads/4), 'Progress Tracking': Math.floor(totalUsers/4) },
        { name: 'Week 2', 'CV Uploads': Math.floor(totalCVUploads/3), 'Progress Tracking': Math.floor(totalUsers/3) },
        { name: 'Week 3', 'CV Uploads': Math.floor(totalCVUploads/2), 'Progress Tracking': Math.floor(totalUsers/2) },
        { name: 'Week 4', 'CV Uploads': totalCVUploads, 'Progress Tracking': totalUsers },
      ],
      yearly: [
        { name: 'Q1', 'CV Uploads': Math.floor(totalCVUploads/4), 'Progress Tracking': Math.floor(totalUsers/4) },
        { name: 'Q2', 'CV Uploads': Math.floor(totalCVUploads/3), 'Progress Tracking': Math.floor(totalUsers/3) },
        { name: 'Q3', 'CV Uploads': Math.floor(totalCVUploads/2), 'Progress Tracking': Math.floor(totalUsers/2) },
        { name: 'Q4', 'CV Uploads': totalCVUploads, 'Progress Tracking': totalUsers },
      ]
    };

    const reviewWorkload = {
      pending: pendingCVs,
      reviewed: reviewedCVs,
      openJobs: totalJobs
    };

    res.json({ stats, recentActivity, chartData, reviewWorkload });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
};
