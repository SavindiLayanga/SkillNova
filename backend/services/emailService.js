import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Enum for Email Types
export const EmailType = {
  PAYMENT: 'PAYMENT',
  SYSTEM: 'SYSTEM',
  SECURITY: 'SECURITY',
  DATABASE: 'DATABASE',
  AI: 'AI',
  USER: 'USER',
  COURSE: 'COURSE',
  JOB: 'JOB'
};

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper function to build the branded HTML template
const buildHtmlTemplate = (title, message, type) => {
  const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SkillNova</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #ef4444; margin-top: 0; display: flex; align-items: center; gap: 8px;">
          🚨 Critical Alert
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 100px; font-weight: bold;">Type:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${type}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: bold;">Time:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${dateStr}</td>
          </tr>
        </table>

        <div style="margin-top: 25px;">
          <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 10px;">${title}</h3>
          <p style="color: #334155; line-height: 1.6; margin: 0;">${message}</p>
        </div>

        <div style="margin-top: 35px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Admin Dashboard
          </a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        This is an automated message from the SkillNova platform. Please do not reply.
      </div>
    </div>
  `;
};

/**
 * Send a critical alert email to the admin
 * @param {Object} options 
 * @param {string} options.type - One of EmailType enum
 * @param {string} options.title - Short title of the alert
 * @param {string} options.message - Detailed message of the alert
 */
export const sendCriticalAlert = async ({ type, title, message }) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL not set. Skipping critical alert email.");
      return;
    }

    const html = buildHtmlTemplate(title, message, type || EmailType.SYSTEM);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: adminEmail,
      subject: `[SkillNova Alert] ${title}`,
      html: html,
    });
    
    console.log(`Critical alert email sent: ${title}`);
  } catch (error) {
    console.error("Failed to send critical alert email:", error);
    // Graceful error handling - we log it but don't crash the application
  }
};

/**
 * Send a daily digest email (Placeholder for future implementation)
 * @param {Object} data 
 */
export const sendDailyDigest = async (data) => {
  try {
    // Implementation for daily digest goes here
    console.log("sendDailyDigest called with data:", data);
  } catch (error) {
    console.error("Failed to send daily digest email:", error);
  }
};

/**
 * Send a weekly report email (Placeholder for future implementation)
 * @param {Object} data 
 */
export const sendWeeklyReport = async (data) => {
  try {
    // Implementation for weekly report goes here
    console.log("sendWeeklyReport called with data:", data);
  } catch (error) {
    console.error("Failed to send weekly report email:", error);
  }
};

/**
 * Send a test email to verify SMTP configuration
 */
export const sendTestEmail = async () => {
  return sendCriticalAlert({
    type: EmailType.SYSTEM,
    title: "Test Email Configuration",
    message: "This is a test email to verify that the SkillNova SMTP configuration is working correctly."
  });
};

/**
 * Send a course recommendation email to a user
 * @param {string} userEmail - The email of the user
 * @param {string} userName - The name of the user
 * @param {Array} courses - The matched courses
 */
export const sendCourseRecommendationsEmail = async (userEmail, userName, courses) => {
  try {
    const coursesHtml = courses.map(course => `
      <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 16px;">${course.title}</h4>
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Platform: ${course.provider} | Level: ${course.level}</p>
        <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;">Match Score: ${course.matchScore}</p>
        <a href="${course.url || '#'}" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 14px;">View Course</a>
      </div>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SkillNova</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #334155; line-height: 1.6;">Based on your recent CV analysis and target role, we have found some new courses that will help you bridge your skill gaps.</p>
          
          <div style="margin-top: 25px;">
            <h3 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Top Recommended Courses</h3>
            ${coursesHtml}
          </div>

          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/learning" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View All Recommendations
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          You are receiving this email because you opted into Course Recommendations in your SkillNova settings.<br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #64748b;">Manage Preferences</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: userEmail,
      subject: `[SkillNova] New Course Recommendations for You!`,
      html: html,
    });
    
    console.log(`Course recommendation email sent to: ${userEmail}`);
  } catch (error) {
    console.error("Failed to send course recommendation email:", error);
  }
};

/**
 * Send a weekly progress reminder email to a user
 * @param {string} userEmail - The email of the user
 * @param {string} userName - The name of the user
 * @param {Object} stats - The progress stats of the user
 */
export const sendWeeklyProgressReminderEmail = async (userEmail, userName, stats = {}) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SkillNova Weekly Progress</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #334155; line-height: 1.6;">Here is your weekly progress update! Keep up the great work and continue pushing towards your career goals.</p>
          
          <div style="margin-top: 25px;">
            <h3 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Your Stats</h3>
            <ul style="color: #334155; line-height: 1.6;">
              <li><strong>Skill Tests Completed:</strong> ${stats.testsCompleted || 0}</li>
              <li><strong>Average Score:</strong> ${stats.averageScore || 0}%</li>
            </ul>
          </div>

          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          You are receiving this email because you opted into Weekly progress reminders in your SkillNova settings.<br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #64748b;">Manage Preferences</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: userEmail,
      subject: `[SkillNova] Your Weekly Progress Update`,
      html: html,
    });
    
    console.log(`Weekly progress reminder email sent to: ${userEmail}`);
  } catch (error) {
    console.error("Failed to send weekly progress reminder email:", error);
  }
};

/**
 * Send a job match alert email to a user
 * @param {string} userEmail - The email of the user
 * @param {string} userName - The name of the user
 * @param {Array} jobs - The matched jobs
 */
export const sendJobMatchAlertEmail = async (userEmail, userName, jobs = []) => {
  try {
    const jobsHtml = jobs.map(job => `
      <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 16px;">${job.title}</h4>
        <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">${job.company} - ${job.location || 'Remote'}</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 14px;">View Job</a>
      </div>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SkillNova Job Alerts</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #334155; line-height: 1.6;">We found some new jobs that match your profile!</p>
          
          <div style="margin-top: 25px;">
            <h3 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Top Matches</h3>
            ${jobsHtml}
          </div>

          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View All Jobs
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          You are receiving this email because you opted into New job match alerts in your SkillNova settings.<br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #64748b;">Manage Preferences</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: userEmail,
      subject: `[SkillNova] New Job Matches for You!`,
      html: html,
    });
    
    console.log(`Job match alert email sent to: ${userEmail}`);
  } catch (error) {
    console.error("Failed to send job match alert email:", error);
  }
};

/**
 * Send a skill test availability alert email to a user
 * @param {string} userEmail - The email of the user
 * @param {string} userName - The name of the user
 */
export const sendSkillTestAvailabilityAlertEmail = async (userEmail, userName) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SkillNova Test Alerts</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #334155; line-height: 1.6;">New skill tests have been unlocked and are available in your library! Sharpen your skills and see how you stack up.</p>
          
          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/skill-test" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Take a Skill Test
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          You are receiving this email because you opted into Skill test availability alerts in your SkillNova settings.<br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #64748b;">Manage Preferences</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: userEmail,
      subject: `[SkillNova] New Skill Tests are Available!`,
      html: html,
    });
    
    console.log(`Skill test alert email sent to: ${userEmail}`);
  } catch (error) {
    console.error("Failed to send skill test alert email:", error);
  }
};

/**
 * Send a course completion reminder email to a user
 * @param {string} userEmail - The email of the user
 * @param {string} userName - The name of the user
 * @param {Object} learningPath - The user's active learning path
 */
export const sendCourseCompletionReminderEmail = async (userEmail, userName, learningPath) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SkillNova Course Reminder</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #334155; line-height: 1.6;">You're making great progress towards becoming a <strong>${learningPath.targetRole}</strong>! Don't lose momentum now.</p>
          
          <div style="margin-top: 25px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
            <p style="color: #0f172a; margin: 0; font-weight: bold;">Current Progress: ${learningPath.progress || 0}%</p>
          </div>

          <div style="margin-top: 35px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/learning" 
               style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Continue Learning
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          You are receiving this email because you opted into Course completion reminders in your SkillNova settings.<br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings" style="color: #64748b;">Manage Preferences</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: userEmail,
      subject: `[SkillNova] Keep up the momentum on your Learning Path!`,
      html: html,
    });
    
    console.log(`Course completion reminder email sent to: ${userEmail}`);
  } catch (error) {
    console.error("Failed to send course completion reminder email:", error);
  }
};

let etherealTransporter = null;

export const sendCVAnalysisEmail = async (toEmail, analysisData) => {
  try {
    const { cvScore, targetRole } = analysisData;
    const date = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    const dashboardUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const html = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px;">SkillNova</h1>
        </div>
        <h2 style="color: #334155; font-size: 20px; margin-top: 0;">Your CV Analysis is Ready!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Great news! We have successfully analyzed your recently uploaded CV.
        </p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: bold;">Analysis Summary</p>
          <p style="margin: 4px 0; color: #0f172a; font-size: 15px;"><strong>Target Role:</strong> ${targetRole || "Software Developer"}</p>
          <p style="margin: 4px 0; color: #0f172a; font-size: 15px;"><strong>Career Readiness Score:</strong> <span style="color: #2563eb; font-weight: bold;">${cvScore}%</span></p>
          <p style="margin: 4px 0; color: #0f172a; font-size: 15px;"><strong>Analyzed On:</strong> ${date}</p>
        </div>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Log in to your dashboard to view your AI-powered career insights, identify missing skills, and discover personalized job matches tailored to your profile.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            View AI Insights
          </a>
        </div>
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} SkillNova. All rights reserved.</p>
          <p style="margin: 4px 0;">You received this email because you opted in to CV Review Updates in your Communication Settings.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"SkillNova" <noreply@skillnova.com>',
      to: toEmail,
      subject: "Your CV Analysis is Ready – SkillNova",
      html: html,
    };

    let info;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      info = await transporter.sendMail(mailOptions);
    } else {
      if (!etherealTransporter) {
        console.log("No SMTP credentials found. Creating Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        etherealTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }
      info = await etherealTransporter.sendMail(mailOptions);
      console.log(`[Ethereal Preview URL] -> ${nodemailer.getTestMessageUrl(info)}`);
    }

    console.log(`CV Analysis email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("Failed to send CV analysis email:", error);
  }
};
