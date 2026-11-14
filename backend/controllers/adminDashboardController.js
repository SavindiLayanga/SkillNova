import { User } from '../models/User.js';
import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';
import { LibraryTest } from '../models/LibraryTest.js';
import { AdminNotification } from '../models/AdminNotification.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      allUsers,
      allCVs,
      totalJobs,
      totalCourses,
      totalSkills,
      recentUsers,
      recentCVs,
      pendingCVs,
      reviewedCVs,
    ] = await Promise.all([
      User.find({ role: 'user', isDeleted: false }, 'createdAt').lean(),
      CVAnalysis.find({}, 'createdAt').lean(),
      Job.countDocuments({ status: { $ne: 'deleted' } }),
      Course.countDocuments(),
      LibraryTest.countDocuments(),
      User.find({ role: 'user', isDeleted: false }).sort({ createdAt: -1 }).limit(2).lean(),
      CVAnalysis.find().sort({ createdAt: -1 }).limit(2).lean(),
      CVAnalysis.countDocuments({ score: { $exists: false } }),
      CVAnalysis.countDocuments({ score: { $exists: true } }),
    ]);

    const totalUsers = allUsers.length;
    const totalCVUploads = allCVs.length;

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

    const countItems = (items, start, end) => items.filter(i => {
      const d = new Date(i.createdAt);
      return d >= start && d <= end;
    }).length;

    const now = new Date();
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setHours(23,59,59,999);
      weekly.push({
        name: start.toLocaleDateString('en-US', { weekday: 'short' }),
        'CV Uploads': countItems(allCVs, start, end),
        'Progress Tracking': countItems(allUsers, start, end)
      });
    }

    const monthly = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i * 7) - 7);
      const end = new Date(now);
      end.setDate(now.getDate() - (i * 7));
      monthly.push({
        name: `Week ${4 - i}`,
        'CV Uploads': countItems(allCVs, start, end),
        'Progress Tracking': countItems(allUsers, start, end)
      });
    }

    const yearly = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setMonth(now.getMonth() - (i * 3) - 3);
      const end = new Date(now);
      end.setMonth(now.getMonth() - (i * 3));
      yearly.push({
        name: `Q${4 - i}`,
        'CV Uploads': countItems(allCVs, start, end),
        'Progress Tracking': countItems(allUsers, start, end)
      });
    }

    const chartData = { weekly, monthly, yearly };

    const reviewWorkload = {
      pending: pendingCVs,
      reviewed: reviewedCVs,
      openJobs: totalJobs
    };

    // 🌟 Identify Candidates with >= 90% Readiness (Industry Job Ready)
    const highScoringCVs = await CVAnalysis.find({
      $or: [
        { score: { $gte: 90 } },
        { cvScore: { $gte: 90 } },
        { skillMatchScore: { $gte: 90 } },
        { careerReadinessScore: { $gte: 90 } }
      ]
    }).sort({ createdAt: -1 }).lean();

    const candidateMap = new Map();
    for (const cv of highScoringCVs) {
      const uid = cv.userId || cv.email;
      if (!uid || candidateMap.has(uid)) continue;

      const user = await User.findOne({ 
        $or: [{ uid: cv.userId }, { email: cv.email }] 
      }).lean();

      const candidateName = user?.name || cv.name || "Candidate";
      const score = Math.max(cv.score || 0, cv.cvScore || 0, cv.skillMatchScore || 0, cv.careerReadinessScore || 0, 90);
      const targetRole = cv.targetRole || user?.targetRole || "Software Developer";
      const userRouteId = user?._id?.toString() || cv.userId;

      candidateMap.set(uid, {
        id: cv._id,
        userId: userRouteId,
        studentUid: cv.userId,
        name: candidateName,
        email: user?.email || cv.email || "Not specified",
        targetRole,
        score,
        fileName: cv.fileName || "CV_Document.pdf",
        skills: cv.skills || cv.technicalSkills || [],
        verifiedSkills: cv.verifiedSkills || [],
        missingSkills: cv.missingSkills || [],
        updatedAt: cv.updatedAt || cv.createdAt
      });

      // Ensure an Admin Notification exists for each industry-ready candidate
      try {
        const notifExists = await AdminNotification.findOne({
          message: { $regex: candidateName, $options: 'i' },
          type: "success"
        });
        if (!notifExists) {
          await AdminNotification.create({
            title: "🎯 Industry Ready Candidate Alert!",
            message: `${candidateName} has achieved ${score}% Job Readiness for "${targetRole}" and is fully qualified for industry placement.`,
            type: "success",
            link: `/admin/users/${userRouteId}`
          });
        }
      } catch (notifErr) {
        console.warn("Could not ensure admin notification:", notifErr.message);
      }
    }

    const jobReadyCandidates = Array.from(candidateMap.values());

    res.json({ stats, recentActivity, chartData, reviewWorkload, jobReadyCandidates });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
};
