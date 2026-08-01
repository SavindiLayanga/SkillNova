import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';
import UserSettings from '../models/UserSettings.js';
import { User } from '../models/User.js';

export const getJobMatches = async (req, res) => {
  try {
    // Fetch user settings
    const settings = await UserSettings.findOne({ userId: req.user.uid });
    const showRemoteFirst = settings?.showRemoteJobsFirst || false;
    const useCVData = settings?.useCVDataForMatchScoring ?? true; // Default to true if not set

    let userSkills = [];
    let targetRole = '';

    if (useCVData) {
      const analysis = await CVAnalysis.findOne({ userId: req.user.uid, isActive: true });
      if (analysis) {
        userSkills = (analysis.skills || []).map(s => s.toLowerCase());
      }
    } else {
      // Fallback: Use user's manual profile data (targetRole)
      const user = await User.findOne({ uid: req.user.uid });
      if (user && user.targetRole) {
        targetRole = user.targetRole.toLowerCase();
      }
    }

    // Fetch active jobs
    const jobs = await Job.find({ status: { $in: ['active', 'Active'] } });

    // Calculate match score
    const matchedJobs = jobs.map(job => {
      let matchPercentage = 50; // Default

      if (useCVData && userSkills.length > 0) {
        const jobSkills = (job.skills || []).map(s => s.toLowerCase());
        let matchedCount = 0;
        jobSkills.forEach(skill => {
          if (userSkills.includes(skill)) matchedCount++;
        });
        matchPercentage = jobSkills.length > 0 
          ? Math.round((matchedCount / jobSkills.length) * 100) 
          : 50;
      } else if (!useCVData && targetRole) {
        // Simple fallback matching based on target role vs job title
        const jobTitle = (job.title || '').toLowerCase();
        if (jobTitle.includes(targetRole) || targetRole.includes(jobTitle)) {
          matchPercentage = 85;
        } else {
          matchPercentage = 50 + Math.floor(Math.random() * 20); // Random 50-70 for variety
        }
      }

      const isRemote = (job.location && job.location.toLowerCase().includes('remote')) || 
                       (job.jobType && job.jobType.toLowerCase().includes('remote'));

      return {
        ...job.toObject(),
        match: matchPercentage,
        isRemote
      };
    });

    // Sort jobs
    matchedJobs.sort((a, b) => {
      if (showRemoteFirst) {
        if (a.isRemote && !b.isRemote) return -1;
        if (!a.isRemote && b.isRemote) return 1;
      }
      // Then sort by match percentage descending
      return b.match - a.match;
    });

    res.json(matchedJobs.slice(0, 10)); // Return top 10 matches
  } catch (error) {
    console.error('Error fetching job matches:', error);
    res.status(500).json({ error: 'Failed to fetch job matches' });
  }
};

export const getCourseMatches = async (req, res) => {
  try {
    // Fetch user settings
    const settings = await UserSettings.findOne({ userId: req.user.uid });
    const useCVData = settings?.useCVDataForMatchScoring ?? true; // Default to true if not set
    const prioritizeBeginner = settings?.prioritizeBeginnerFriendlyPaths || false;

    let missingSkills = [];
    let targetRole = '';

    if (useCVData) {
      const analysis = await CVAnalysis.findOne({ userId: req.user.uid, isActive: true });
      if (analysis) {
        missingSkills = (analysis.missingSkills || []).map(s => s.toLowerCase());
      }
    } else {
      // Fallback: Use user's manual profile data
      const user = await User.findOne({ uid: req.user.uid });
      if (user && user.targetRole) {
        targetRole = user.targetRole.toLowerCase();
      }
    }

    // Fetch published courses
    const courses = await Course.find({ status: 'Published' });

    // Match courses
    const matchedCourses = courses.map(course => {
      let matchScore = 0;

      if (useCVData && missingSkills.length > 0) {
        const courseSkills = (course.skills || []).map(s => s.toLowerCase());
        courseSkills.forEach(skill => {
          if (missingSkills.includes(skill)) matchScore++;
        });
      } else if (!useCVData && targetRole) {
        // Fallback matching: title contains target role keywords
        const title = (course.title || '').toLowerCase();
        if (title.includes(targetRole) || targetRole.includes(title)) {
          matchScore = 3; // Give a higher score for direct match
        } else {
          matchScore = Math.floor(Math.random() * 2); // Random 0 or 1
        }
      }

      return {
        ...course.toObject(),
        matchScore
      };
    });

    // Sort courses
    matchedCourses.sort((a, b) => {
      if (prioritizeBeginner) {
        const aIsBeginner = a.difficulty?.toLowerCase() === 'beginner';
        const bIsBeginner = b.difficulty?.toLowerCase() === 'beginner';
        if (aIsBeginner && !bIsBeginner) return -1;
        if (!aIsBeginner && bIsBeginner) return 1;
      }
      // Then sort by match score descending
      return b.matchScore - a.matchScore;
    });

    // Return courses that cover at least one missing skill, or top 5 if none cover it exactly
    let results = matchedCourses.filter(c => c.matchScore > 0);
    if (results.length === 0) results = matchedCourses.slice(0, 5);

    res.json(results);
  } catch (error) {
    console.error('Error fetching course matches:', error);
    res.status(500).json({ error: 'Failed to fetch course matches' });
  }
};

import { sendCourseRecommendationsEmail } from '../services/emailService.js';

export const sendCourseRecommendations = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email;
    const userName = req.user.name || 'User';

    // 1. Check if user has opted into email recommendations
    const settings = await UserSettings.findOne({ userId });
    if (!settings || !settings.emailCourseRecommendations) {
      return res.status(400).json({ error: 'User has not opted in for email course recommendations' });
    }

    // 2. Generate course recommendations (reusing logic)
    const analysis = await CVAnalysis.findOne({ userId, isActive: true });
    if (!analysis) {
      return res.status(404).json({ error: 'No active CV analysis found. Cannot generate recommendations.' });
    }

    const missingSkills = (analysis.missingSkills || []).map(s => s.toLowerCase());
    const courses = await Course.find({ status: 'Published' });

    const matchedCourses = courses.map(course => {
      const courseSkills = (course.skills || []).map(s => s.toLowerCase());
      let overlapCount = 0;
      courseSkills.forEach(skill => {
        if (missingSkills.includes(skill)) overlapCount++;
      });
      return {
        ...course.toObject(),
        matchScore: overlapCount
      };
    });

    matchedCourses.sort((a, b) => b.matchScore - a.matchScore);
    let topCourses = matchedCourses.filter(c => c.matchScore > 0);
    if (topCourses.length === 0) topCourses = matchedCourses.slice(0, 5);
    else topCourses = topCourses.slice(0, 5); // Limit to top 5 in email

    // 3. Send email
    await sendCourseRecommendationsEmail(userEmail, userName, topCourses);

    res.json({ message: 'Course recommendations email sent successfully' });
  } catch (error) {
    console.error('Error sending course recommendations email:', error);
    res.status(500).json({ error: 'Failed to send course recommendations email' });
  }
};
