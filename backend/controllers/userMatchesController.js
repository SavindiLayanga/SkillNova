import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';
import UserSettings from '../models/UserSettings.js';

export const getJobMatches = async (req, res) => {
  try {
    const analysis = await CVAnalysis.findOne({ userId: req.user.uid, isActive: true });
    if (!analysis) {
      return res.status(404).json({ error: 'No active CV analysis found.' });
    }

    const userSkills = (analysis.skills || []).map(s => s.toLowerCase());
    
    // Fetch user settings
    const settings = await UserSettings.findOne({ userId: req.user.uid });
    const showRemoteFirst = settings?.showRemoteJobsFirst || false;

    // Fetch active jobs
    const jobs = await Job.find({ status: { $in: ['active', 'Active'] } });

    // Calculate match score
    const matchedJobs = jobs.map(job => {
      const jobSkills = (job.skills || []).map(s => s.toLowerCase());
      let matchedCount = 0;
      jobSkills.forEach(skill => {
        if (userSkills.includes(skill)) matchedCount++;
      });
      
      const matchPercentage = jobSkills.length > 0 
        ? Math.round((matchedCount / jobSkills.length) * 100) 
        : 50; // Default if job has no specific skills listed

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
    const analysis = await CVAnalysis.findOne({ userId: req.user.uid, isActive: true });
    if (!analysis) {
      return res.status(404).json({ error: 'No active CV analysis found.' });
    }

    const missingSkills = (analysis.missingSkills || []).map(s => s.toLowerCase());
    
    // Fetch published courses
    const courses = await Course.find({ status: 'Published' });

    // Match courses that teach the missing skills
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

    // Sort by how many missing skills they cover
    matchedCourses.sort((a, b) => b.matchScore - a.matchScore);

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
