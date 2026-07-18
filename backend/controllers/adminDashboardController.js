import { User } from '../models/User.js';
import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCVUploads, totalJobs, totalCourses] = await Promise.all([
      User.countDocuments({ role: 'user', isDeleted: false }),
      CVAnalysis.countDocuments(),
      Job.countDocuments({ status: { $ne: 'deleted' } }),
      Course.countDocuments()
    ]);

    // For metrics that don't have dedicated collections yet (e.g. Skills), we mock them.
    const stats = [
      { label: "Total Users", value: totalUsers, change: "+12% from last month" },
      { label: "Total CV Uploads", value: totalCVUploads, change: "+5% from last month" },
      { label: "Total Jobs", value: totalJobs, change: "Live from DB" },
      { label: "Total Courses", value: totalCourses, change: "Live from DB" },
      { label: "Total Skills", value: 56, change: "+2% from last month" }
    ];

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
};
