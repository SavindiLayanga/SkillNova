import cron from "node-cron";
import { UserSettings } from "../models/UserSettings.js";
import { User } from "../models/User.js";
import { LibraryTest } from "../models/LibraryTest.js";
import Job from "../models/Job.js";
import { LearningPath } from "../models/LearningPath.js";
import { sendWeeklyProgressReminderEmail, sendJobMatchAlertEmail, sendSkillTestAvailabilityAlertEmail, sendCourseCompletionReminderEmail } from "./emailService.js";

export const initializeCronJobs = () => {
  // Schedule a weekly task to run every Monday at 9:00 AM
  // For testing purposes during development, you can change to "* * * * *"
  cron.schedule("0 9 * * 1", async () => {
    console.log("Running weekly progress reminders job...");
    try {
      // Find all users who opted in for weekly progress reminders
      const optedInSettings = await UserSettings.find({ weeklyProgressReminders: true });
      
      for (const settings of optedInSettings) {
        const user = await User.findOne({ uid: settings.userId });
        
        if (user && user.email) {
          // Optional: Fetch some stats for the user
          // For example, finding the completed library tests for the user
          const completedTests = await LibraryTest.find({ 
            userId: user.uid, 
            status: "Completed" 
          });
          
          let totalScore = 0;
          completedTests.forEach(test => {
            totalScore += test.score || 0;
          });
          
          const averageScore = completedTests.length > 0 
            ? Math.round(totalScore / completedTests.length) 
            : 0;
            
          const stats = {
            testsCompleted: completedTests.length,
            averageScore: averageScore
          };
          
          await sendWeeklyProgressReminderEmail(user.email, user.name, stats);
        }
      }
      
      console.log("Weekly progress reminders job completed successfully.");
    } catch (error) {
      console.error("Error running weekly progress reminders job:", error);
    }
  });

  // Schedule a daily task for new job match alerts at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily job match alerts job...");
    try {
      // Find all users who opted in for job match alerts
      const optedInSettings = await UserSettings.find({ newJobMatchAlerts: true });
      
      // Look for jobs added in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const newJobs = await Job.find({ 
        createdAt: { $gte: yesterday },
        status: 'Active'
      }).limit(5); // Sending top 5 for the alert
      
      if (newJobs.length > 0) {
        for (const settings of optedInSettings) {
          const user = await User.findOne({ uid: settings.userId });
          
          if (user && user.email) {
            await sendJobMatchAlertEmail(user.email, user.name, newJobs);
          }
        }
      }
      
      console.log("Daily job match alerts job completed successfully.");
    } catch (error) {
      console.error("Error running daily job match alerts job:", error);
    }
  });

  // Schedule a weekly task for skill test availability alerts (e.g., Wednesday at 10:00 AM)
  cron.schedule("0 10 * * 3", async () => {
    console.log("Running weekly skill test availability alerts job...");
    try {
      const optedInSettings = await UserSettings.find({ skillTestAvailabilityAlerts: true });
      
      for (const settings of optedInSettings) {
        const user = await User.findOne({ uid: settings.userId });
        if (user && user.email) {
          // You could add complex logic here (e.g., check if they have uncompleted tests)
          // For now, we'll send a general availability alert
          await sendSkillTestAvailabilityAlertEmail(user.email, user.name);
        }
      }
      
      console.log("Weekly skill test availability alerts job completed successfully.");
    } catch (error) {
      console.error("Error running weekly skill test availability alerts job:", error);
    }
  });

  // Schedule a weekly task for course completion reminders (e.g., Thursday at 9:00 AM)
  cron.schedule("0 9 * * 4", async () => {
    console.log("Running weekly course completion reminders job...");
    try {
      const optedInSettings = await UserSettings.find({ courseCompletionReminders: true });
      
      for (const settings of optedInSettings) {
        const user = await User.findOne({ uid: settings.userId });
        if (user && user.email) {
          // Find an active learning path that is not 100% complete
          const activePath = await LearningPath.findOne({ 
            userId: user.uid, 
            status: 'active',
            progress: { $lt: 100 }
          });
          
          if (activePath) {
            await sendCourseCompletionReminderEmail(user.email, user.name, activePath);
          }
        }
      }
      
      console.log("Weekly course completion reminders job completed successfully.");
    } catch (error) {
      console.error("Error running weekly course completion reminders job:", error);
    }
  });

  console.log("Cron jobs initialized.");
};
