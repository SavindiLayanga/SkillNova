import { CVAnalysis } from '../models/CVAnalysis.js';
import Job from '../models/Job.js';
import { Course } from '../models/Course.js';
import { UserSettings } from '../models/UserSettings.js';
import { User } from '../models/User.js';
import { LearningPath } from '../models/LearningPath.js';
import { SkillTest } from '../models/SkillTest.js';
import { Certificate } from '../models/Certificate.js';
import { JobReadiness } from '../models/JobReadiness.js';

export const getJobMatches = async (req, res) => {
  try {
    // Fetch user settings
    const settings = await UserSettings.findOne({ userId: req.user.uid });
    const showRemoteFirst = settings?.showRemoteJobsFirst || false;
    const useCVData = settings?.useCVDataForMatchScoring ?? true;

    let userSkills = [];
    let targetRole = '';

    const analysis = await CVAnalysis.findOne({ userId: req.user.uid, isActive: true }).sort({ createdAt: -1 });
    if (analysis) {
      const rawSkills = [
        ...(analysis.skills || []),
        ...(analysis.technicalSkills || []),
        ...(analysis.verifiedSkills || [])
      ];
      userSkills = rawSkills.map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim()).filter(Boolean);
      if (analysis.targetRole) {
        targetRole = analysis.targetRole.toLowerCase().trim();
      }
    }

    // Also check Certificate & JobReadiness for targetRole and certified skills
    const cert = await Certificate.findOne({ userId: req.user.uid }).sort({ createdAt: -1 });
    if (cert) {
      if (!targetRole && cert.targetRole) {
        targetRole = cert.targetRole.toLowerCase().trim();
      }
      if (cert.skillsCompleted && cert.skillsCompleted.length > 0) {
        const certSkills = cert.skillsCompleted.map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());
        userSkills = [...new Set([...userSkills, ...certSkills])];
      }
    }

    // Include newly learned & verified skills from passed tests
    const passedTests = await SkillTest.find({ userId: req.user.uid, isCompleted: true });
    const verifiedTestSkills = passedTests.map(t => (t.skillName || '').toLowerCase().trim()).filter(Boolean);
    userSkills = [...new Set([...userSkills, ...verifiedTestSkills])];

    if (!targetRole) {
      const user = await User.findOne({ uid: req.user.uid });
      if (user && user.targetRole) {
        targetRole = user.targetRole.toLowerCase().trim();
      }
    }

    if (!targetRole && analysis?.primaryRole?.role) {
      targetRole = analysis.primaryRole.role.toLowerCase().trim();
    }

    if (!targetRole && analysis?.careerRecommendations && analysis.careerRecommendations.length > 0) {
      targetRole = analysis.careerRecommendations[0].toLowerCase().trim();
    }

    // Check readiness score for high-achiever boost
    const jobReadiness = await JobReadiness.findOne({ userId: req.user.uid });
    if (!targetRole && jobReadiness?.targetRole) {
      targetRole = jobReadiness.targetRole.toLowerCase().trim();
    }
    const readinessScore = Math.max(
      jobReadiness?.score || 0,
      cert?.jobReadinessScore || 0,
      analysis?.careerReadinessScore || 0,
      analysis?.cvScore || 0,
      analysis?.skillMatchScore || 0
    );

    const isPersonalized = settings?.personalizedRecommendations !== false;
    let userProgress = 0;
    
    if (isPersonalized) {
      const activePath = await LearningPath.findOne({ userId: req.user.uid, status: 'active' });
      if (activePath) {
        userProgress = activePath.progress || 0;
      }
    }

    // Fetch active jobs
    const jobs = await Job.find({ status: { $in: ['active', 'Active'] } });

    // Calculate match score
    const matchedJobs = jobs.map(job => {
      let matchPercentage = 60; // Base default

      const jobTitle = (job.title || '').toLowerCase();
      const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim());

      if (userSkills.length > 0 && jobSkills.length > 0) {
        let matchedCount = 0;
        jobSkills.forEach(js => {
          // Flexible partial matching (e.g. 'react' matches 'react.js', 'api' matches 'rest apis')
          const matches = userSkills.some(us => 
            us === js || us.includes(js) || js.includes(us)
          );
          if (matches) matchedCount++;
        });

        matchPercentage = Math.round((matchedCount / jobSkills.length) * 100);
      } else if (targetRole) {
        if (jobTitle.includes(targetRole) || targetRole.includes(jobTitle)) {
          matchPercentage = 85;
        }
      }

      // Role alignment bonus
      if (targetRole) {
        const targetWords = targetRole.split(/\s+/).filter(w => w.length > 2);
        const matchesTargetWord = targetWords.some(tw => jobTitle.includes(tw));
        if (matchesTargetWord) {
          matchPercentage = Math.max(matchPercentage, 75) + 12;
        }
      }

      // If student achieved high readiness (>= 90%), boost eligible jobs
      if (readinessScore >= 90) {
        matchPercentage += 10;
      } else if (userProgress > 0) {
        matchPercentage += Math.round(userProgress * 0.1);
      }

      // Ensure a realistic attractive score range [50 - 99]
      matchPercentage = Math.min(Math.max(matchPercentage, 55), 98);

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
      return b.match - a.match;
    });

    res.json(matchedJobs.slice(0, 15));
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

    // Filter out skills candidate has already passed
    const passedTestsForCourses = await SkillTest.find({ userId: req.user.uid, isCompleted: true });
    const passedSkillNames = passedTestsForCourses.map(t => (t.skillName || '').toLowerCase());
    missingSkills = missingSkills.filter(s => !passedSkillNames.includes(s));

    if (!targetRole) {
      const user = await User.findOne({ uid: req.user.uid });
      if (user && user.targetRole) {
        targetRole = user.targetRole.toLowerCase();
      }
    }

    const isPersonalized = settings?.personalizedRecommendations !== false;
    let userProgress = 0;
    
    if (isPersonalized) {
      const activePath = await LearningPath.findOne({ userId: req.user.uid, status: 'active' });
      if (activePath) {
        userProgress = activePath.progress || 0;
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

      if (isPersonalized) {
        // Boost if course matches target role explicitly
        const title = (course.title || '').toLowerCase();
        if (targetRole && title.includes(targetRole)) {
          matchScore += 2;
        }
        
        // If user is far along in progress, boost advanced courses; if early, boost beginner
        if (userProgress > 50 && course.difficulty?.toLowerCase() === 'advanced') {
          matchScore += 1;
        } else if (userProgress <= 50 && course.difficulty?.toLowerCase() === 'beginner') {
          matchScore += 1;
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
