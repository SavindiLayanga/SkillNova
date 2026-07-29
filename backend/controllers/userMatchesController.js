import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';

export const getJobMatches = async (req, res) => {
  try {
    const analysis = await CVAnalysis.findOne({ userId: req.user.uid, isActive: true });
    if (!analysis) {
      return res.status(404).json({ error: 'No active CV analysis found.' });
    }

    const userSkills = (analysis.skills || []).map(s => s.toLowerCase());
    
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

      return {
        ...job.toObject(),
        match: matchPercentage
      };
    });

    // Sort by match percentage descending
    matchedJobs.sort((a, b) => b.match - a.match);

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
