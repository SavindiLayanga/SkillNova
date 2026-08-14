import { CVAnalysis } from '../models/CVAnalysis.js';
import { ManualAnalysis } from '../models/ManualAnalysis.js';
import { User } from '../models/User.js';

export const getCvReviews = async (req, res) => {
  try {
    const cvAnalyses = await CVAnalysis.find().sort({ createdAt: -1 }).lean();
    const manualAnalyses = await ManualAnalysis.find().sort({ createdAt: -1 }).lean();
    
    const combined = [...cvAnalyses, ...manualAnalyses].sort((a, b) => b.createdAt - a.createdAt);

    // Map to frontend structure
    const reviews = await Promise.all(combined.map(async (review) => {
      let studentName = review.name;
      if (!studentName || studentName === "User" || studentName === "Candidate's full name" || studentName.length > 50) {
        const user = await User.findOne({ uid: review.userId }).lean();
        studentName = user?.name || "SkillNova User";
      }

      return {
        id: review._id,
        student: studentName,
        fileName: review.fileName || 'CV_Document.pdf',
        uploadedAt: new Date(review.createdAt).toISOString().split('T')[0],
        score: review.score || review.skillMatchScore || 0,
        status: review.score ? "Reviewed" : "Pending",
        summary: review.aiInsights || "No summary available.",
      };
    }));

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching CV reviews:', error);
    res.status(500).json({ error: 'Failed to fetch CV reviews' });
  }
};
