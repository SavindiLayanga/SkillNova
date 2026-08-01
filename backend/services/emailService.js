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
