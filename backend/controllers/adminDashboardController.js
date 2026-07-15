import { User } from '../models/User.js';
import { CVAnalysis } from '../models/CVAnalysis.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCVUploads] = await Promise.all([
      User.countDocuments({ role: 'user', isDeleted: false }),
      CVAnalysis.countDocuments()
    ]);

    // For metrics that don't have dedicated collections yet, we mock them
    // or calculate based on existing data if applicable.
    const stats = [
      { label: "Total Users", value: totalUsers, change: "+12% from last month" },
      { label: "Total CV Uploads", value: totalCVUploads, change: "+5% from last month" },
      { label: "Total Jobs", value: 145, change: "+10% from last month" },
      { label: "Total Courses", value: 34, change: "0% from last month" },
      { label: "Total Skills", value: 56, change: "+2% from last month" }
    ];

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
};
