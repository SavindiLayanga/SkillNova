import { CVAnalysis } from "../models/CVAnalysis.js";
import { LearningPath } from "../models/LearningPath.js";
import { SkillTest } from "../models/SkillTest.js";
import { JobReadiness } from "../models/JobReadiness.js";

export const evaluateJobReadiness = async (userId) => {
  try {
    // 1. Get CV Score
    const cvAnalysis = await CVAnalysis.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
    const cvScore = cvAnalysis ? (cvAnalysis.cvScore || cvAnalysis.skillMatchScore || 0) : 0;
    const targetRole = cvAnalysis ? cvAnalysis.targetRole : "Unknown Role";

    // 2. Get Learning Progress
    const learningPath = await LearningPath.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
    let progress = 0;
    let allModulesCompleted = false;
    let missingSkills = [];
    
    if (learningPath) {
      progress = learningPath.progress || 0;
      allModulesCompleted = learningPath.modules && learningPath.modules.length > 0 && learningPath.modules.every(m => m.isCompleted);
      missingSkills = learningPath.missingSkills || [];
    }

    // 3. Get Assessment Average & Check Mandatory Skills
    let assessmentAverage = 0;
    let requiredSkillsCompletedPercentage = 0;
    let allMandatoryTestsPassed = true;

    if (missingSkills.length > 0) {
      const tests = await SkillTest.find({ userId, skillName: { $in: missingSkills } });
      
      let totalScore = 0;
      let completedMandatorySkills = new Set();

      tests.forEach(test => {
        totalScore += test.score;
        if (test.isCompleted) {
          completedMandatorySkills.add(test.skillName);
        }
      });

      if (tests.length > 0) {
        assessmentAverage = totalScore / tests.length;
      }
      
      requiredSkillsCompletedPercentage = Math.round((completedMandatorySkills.size / missingSkills.length) * 100);
      allMandatoryTestsPassed = completedMandatorySkills.size === missingSkills.length;
    } else {
      // If no missing skills are defined, consider mandatory requirements met
      requiredSkillsCompletedPercentage = 100;
      allMandatoryTestsPassed = true;
      allModulesCompleted = true; // No learning path needed
    }

    // Calculate Readiness Score: (CVScore 30%) + (Progress 40%) + (AssessmentAverage 30%)
    const readinessScore = Math.round((cvScore * 0.30) + (progress * 0.40) + (assessmentAverage * 0.30));

    const isJobReady = readinessScore >= 90 && allMandatoryTestsPassed && allModulesCompleted;

    // Save to Database
    let jobReadiness = await JobReadiness.findOne({ userId });
    
    if (jobReadiness) {
      jobReadiness.score = readinessScore;
      jobReadiness.targetRole = targetRole;
      jobReadiness.requiredSkillsCompletedPercentage = requiredSkillsCompletedPercentage;
      jobReadiness.assessmentAverage = Math.round(assessmentAverage);
      jobReadiness.isJobReady = isJobReady;
      jobReadiness.lastEvaluatedAt = new Date();
    } else {
      jobReadiness = new JobReadiness({
        userId,
        targetRole,
        score: readinessScore,
        requiredSkillsCompletedPercentage,
        assessmentAverage: Math.round(assessmentAverage),
        isJobReady,
        lastEvaluatedAt: new Date()
      });
    }

    await jobReadiness.save();

    return jobReadiness;

  } catch (error) {
    console.error("Error evaluating job readiness:", error);
    throw error;
  }
};
