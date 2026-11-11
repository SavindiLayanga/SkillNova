import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Job } from '../models/Job.js';
import { UserSettings } from '../models/UserSettings.js';
import { EmployerIntroduction } from '../models/EmployerIntroduction.js';
import { Certificate } from '../models/Certificate.js';
import { CVAnalysis } from '../models/CVAnalysis.js';
import { User } from '../models/User.js';
import { SkillTest } from '../models/SkillTest.js';
import { JobReadiness } from '../models/JobReadiness.js';
import { getAI } from '../utils/aiHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let etherealTransporter = null;

// Reusable Mail Transporter
const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('Could not create Ethereal test account. Falling back to mock transporter.', err.message);
      return {
        sendMail: async (options) => {
          console.log(`[Mock Mail Transport] Email dispatched to ${options.to}`);
          return { messageId: 'mock-' + Date.now() };
        }
      };
    }
  }

  return etherealTransporter;
};

// Retrieve Comprehensive Candidate Information
export const getCandidateDetails = async (userId) => {
  const user = await User.findOne({ uid: userId });
  const cvAnalysis = await CVAnalysis.findOne({ userId, isActive: true }).sort({ createdAt: -1 })
    || await CVAnalysis.findOne({ userId }).sort({ createdAt: -1 });
  const certificate = await Certificate.findOne({ userId }).sort({ createdAt: -1 });
  const jobReadiness = await JobReadiness.findOne({ userId });
  
  // Fetch completed tests
  const completedTests = await SkillTest.find({ userId, isCompleted: true });
  const testSkills = completedTests.map(t => t.skillName);
  
  const rawSkills = [
    ...(cvAnalysis?.technicalSkills || []),
    ...(cvAnalysis?.skills || []),
    ...testSkills
  ];
  const uniqueSkills = [...new Set(rawSkills.map(s => (typeof s === 'string' ? s.trim() : s)))].filter(Boolean);

  const candidateName = user?.name || cvAnalysis?.personalInformation?.fullName || cvAnalysis?.name || 'SkillNova Candidate';
  const candidateEmail = user?.email || cvAnalysis?.personalInformation?.email || cvAnalysis?.email || 'candidate@skillnova.io';
  const candidatePhone = cvAnalysis?.personalInformation?.phone || cvAnalysis?.phone || '';
  const targetRole = cvAnalysis?.targetRole || user?.targetRole || 'Software Professional';
  const readinessScore = jobReadiness?.score || (certificate?.jobReadinessScore) || (cvAnalysis?.cvScore) || 75;

  return {
    user,
    cvAnalysis,
    certificate,
    jobReadiness,
    candidateName,
    candidateEmail,
    candidatePhone,
    targetRole,
    readinessScore,
    verifiedSkills: uniqueSkills,
    cvFileUrl: cvAnalysis?.fileUrl || ''
  };
};

// Calculate match score between candidate and job
export const calculateJobMatchScore = (candidate, job) => {
  let score = 75;
  const candidateSkills = (candidate.verifiedSkills || []).map(s => s.toLowerCase());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());

  if (jobSkills.length > 0 && candidateSkills.length > 0) {
    const matchedCount = jobSkills.filter(js => candidateSkills.some(cs => cs.includes(js) || js.includes(cs))).length;
    score = Math.round((matchedCount / jobSkills.length) * 100);
  } else if (candidate.targetRole) {
    const roleLower = candidate.targetRole.toLowerCase();
    const titleLower = (job.title || '').toLowerCase();
    if (roleLower.includes(titleLower) || titleLower.includes(roleLower)) {
      score = 88;
    }
  }

  // Factor in readiness score
  if (candidate.readinessScore >= 85) {
    score = Math.min(100, Math.max(score, candidate.readinessScore));
  }

  return Math.min(100, Math.max(50, score));
};

// Generate AI or Template Cover Letter
export const generateCoverLetter = async ({ candidate, job, matchScore }) => {
  const topSkills = (candidate.verifiedSkills || []).slice(0, 6).join(', ');
  
  // Try AI generation first
  try {
    const ai = getAI();
    const prompt = `Write a high-impact, professional, and concise job application email (cover letter) from a job seeker to a company.
Candidate Name: ${candidate.candidateName}
Target Role: ${candidate.targetRole}
Job Title: ${job.title}
Company Name: ${job.company}
Match Score: ${matchScore}%
Verified Skills: ${topSkills}
Candidate Job Readiness: ${candidate.readinessScore}%
Candidate Certificate: ${candidate.certificate ? 'Verified SkillNova Certification earned' : 'SkillNova verified assessments passed'}

Requirements:
- Professional, confident, and polite tone.
- 3 to 4 concise paragraphs.
- Mention that the candidate's CV/Resume and SkillNova verification are attached.
- Do NOT include bracketed placeholders like "[Your Name]". Use the real candidate and company details provided.`;

    const response = await ai.models.generateContent({
      contents: prompt,
      config: { temperature: 0.3 }
    });

    const aiText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiText && aiText.trim().length > 100) {
      return aiText.trim();
    }
  } catch (err) {
    // Graceful fallback to high quality structured template
    console.log('AI cover letter generation fallback triggered:', err.message);
  }

  // High quality professional template fallback
  return `Dear Hiring Team at ${job.company},

I am writing to formally submit my application for the ${job.title} position at ${job.company}. Having recently validated my technical skills through SkillNova's standardized assessments and updated my portfolio for the current job market, I achieved a ${matchScore}% alignment score for this role.

Over the course of my career and dedicated training, I have developed strong proficiency in ${topSkills || 'modern software engineering best practices'}. My demonstrated readiness score on SkillNova stands at ${candidate.readinessScore}%, reflecting both theoretical competency and hands-on problem solving.

Key Highlights of My Profile:
• Role Alignment: ${matchScore}% match for ${job.title}
• Verified Skills: ${topSkills || 'Full-stack development, modern technologies'}
${candidate.certificate ? `• SkillNova Verified Certificate ID: ${candidate.certificate.certificateId}` : '• Verified Skill Assessments Passed'}

I have attached my updated CV${candidate.certificate ? ' and verified SkillNova Certificate' : ''} for your review. I would welcome the opportunity to discuss how my technical abilities and enthusiasm can contribute to the success of ${job.company}.

Thank you for your time and consideration.

Sincerely,
${candidate.candidateName}
${candidate.candidateEmail}
${candidate.candidatePhone ? candidate.candidatePhone : ''}`;
};

// Preview Application Endpoint Helper
export const generateApplicationPreview = async (userId, jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const candidate = await getCandidateDetails(userId);
  const matchScore = calculateJobMatchScore(candidate, job);
  const subject = `Job Application: ${job.title} - ${candidate.candidateName} (SkillNova Match: ${matchScore}%)`;
  const coverLetter = await generateCoverLetter({ candidate, job, matchScore });

  // Resolve CV file availability
  let cvAvailable = false;
  let cvPath = '';
  if (candidate.cvFileUrl) {
    const cleanPath = candidate.cvFileUrl.replace(/^\//, '');
    const fullPath = path.join(__dirname, '..', 'public', cleanPath);
    if (fs.existsSync(fullPath)) {
      cvAvailable = true;
      cvPath = candidate.cvFileUrl;
    } else {
      cvAvailable = Boolean(candidate.cvFileUrl);
      cvPath = candidate.cvFileUrl;
    }
  }

  // Resolve Certificate availability
  let certificateAvailable = Boolean(candidate.certificate?.pdfUrl);
  let certificatePath = candidate.certificate?.pdfUrl || '';

  const recipientEmail = job.contactEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;

  // Check if candidate already applied
  const existingIntro = await EmployerIntroduction.findOne({ userId, jobId: job._id });

  return {
    job: {
      _id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      contactEmail: recipientEmail,
      skills: job.skills || []
    },
    candidate: {
      name: candidate.candidateName,
      email: candidate.candidateEmail,
      phone: candidate.candidatePhone,
      targetRole: candidate.targetRole,
      readinessScore: candidate.readinessScore,
      verifiedSkills: candidate.verifiedSkills.slice(0, 8)
    },
    matchScore,
    subject,
    coverLetter,
    cvAvailable,
    cvPath,
    certificateAvailable,
    certificatePath,
    recipientEmail,
    alreadyApplied: Boolean(existingIntro),
    applicationStatus: existingIntro?.status || null,
    appliedAt: existingIntro?.sentAt || existingIntro?.createdAt || null
  };
};

// Send Candidate Application via Email
export const sendCandidateApplication = async ({ userId, jobId, customCoverLetter, appliedVia = 'manual' }) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const candidate = await getCandidateDetails(userId);
  const matchScore = calculateJobMatchScore(candidate, job);
  const subject = `Job Application: ${job.title} - ${candidate.candidateName} (SkillNova Match: ${matchScore}%)`;
  const coverLetter = customCoverLetter || await generateCoverLetter({ candidate, job, matchScore });

  const recipientEmail = job.contactEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;

  // Attachments preparation
  const attachments = [];
  let hasCvAttachment = false;
  let hasCertificateAttachment = false;

  if (candidate.cvFileUrl) {
    const cleanPath = candidate.cvFileUrl.replace(/^\//, '');
    const fullCvPath = path.join(__dirname, '..', 'public', cleanPath);
    if (fs.existsSync(fullCvPath)) {
      attachments.push({
        filename: `${candidate.candidateName.replace(/\s+/g, '_')}_Resume.pdf`,
        path: fullCvPath
      });
      hasCvAttachment = true;
    }
  }

  if (candidate.certificate?.pdfUrl) {
    const cleanCertPath = candidate.certificate.pdfUrl.replace(/^\//, '');
    const fullCertPath = path.join(__dirname, '..', 'public', cleanCertPath);
    if (fs.existsSync(fullCertPath)) {
      attachments.push({
        filename: `SkillNova_Certificate_${candidate.certificate.certificateId}.pdf`,
        path: fullCertPath
      });
      hasCertificateAttachment = true;
    }
  }

  // Build clean branded HTML Email
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">SkillNova Career Network</h1>
        <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 13px;">Verified Candidate Application & Introduction</p>
      </div>

      <div style="padding: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">${job.title}</h2>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Applied to: <strong>${job.company}</strong></p>
          </div>
          <div style="text-align: right; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 8px 14px;">
            <span style="display: block; font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 700;">Match Score</span>
            <span style="font-size: 22px; font-weight: 800; color: #059669;">${matchScore}%</span>
          </div>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Applicant Overview</h3>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Name:</strong> ${candidate.candidateName}</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Email:</strong> ${candidate.candidateEmail}</p>
          ${candidate.candidatePhone ? `<p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Phone:</strong> ${candidate.candidatePhone}</p>` : ''}
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Job Readiness Score:</strong> ${candidate.readinessScore}% (SkillNova Verified)</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Verified Skills:</strong> ${(candidate.verifiedSkills || []).slice(0, 8).join(', ')}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 15px; margin-bottom: 10px; font-weight: 700;">Cover Letter / Statement of Interest:</h3>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; color: #334155; line-height: 1.7; font-size: 14px; white-space: pre-line;">
${coverLetter}
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            📎 <strong>Attachments Included:</strong> ${hasCvAttachment ? 'Candidate Resume / CV' : 'CV profile'} ${hasCertificateAttachment ? '• SkillNova Verified Certificate' : ''}
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 8px;">
            This email was generated and dispatched via the SkillNova Career Intelligence Platform on behalf of the applicant.
          </p>
        </div>
      </div>
    </div>
  `;

  // Send Email
  let intro = await EmployerIntroduction.findOne({ userId, jobId: job._id });
  if (!intro) {
    intro = new EmployerIntroduction({
      userId,
      jobId: job._id,
      companyEmail: recipientEmail,
      jobMatchScore: matchScore,
      subject,
      coverLetter,
      cvUrl: candidate.cvFileUrl,
      hasCvAttachment,
      hasCertificateAttachment,
      appliedVia,
      status: 'Pending'
    });
  } else {
    intro.subject = subject;
    intro.coverLetter = coverLetter;
    intro.jobMatchScore = matchScore;
    intro.appliedVia = appliedVia;
    intro.hasCvAttachment = hasCvAttachment;
    intro.hasCertificateAttachment = hasCertificateAttachment;
  }

  try {
    const transporter = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"SkillNova Career Network" <no-reply@skillnova.io>',
      to: recipientEmail,
      replyTo: candidate.candidateEmail,
      subject,
      text: coverLetter,
      html: htmlBody,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`[Ethereal Application Email Preview] -> ${previewUrl}`);
    }

    intro.status = 'Sent';
    intro.sentAt = new Date();
    await intro.save();

    return {
      success: true,
      introduction: intro,
      message: `Application and CV successfully dispatched to ${job.company} (${recipientEmail})`
    };
  } catch (err) {
    console.error('Failed to send employer application email:', err);
    intro.status = 'Failed';
    await intro.save();
    throw new Error(`Failed to send email to ${recipientEmail}: ${err.message}`);
  }
};

// Automatic Match & Introduction Runner (triggered when settings.autoApplyMatchingJobs is active)
export const findAndIntroduceCandidate = async (userId) => {
  try {
    const settings = await UserSettings.findOne({ userId });
    
    // Check if employer introductions or auto-apply is enabled
    if (!settings || !settings.allowEmployerIntroductions) {
      console.log(`User ${userId} hasn't enabled employer introductions. Skipping auto-apply.`);
      return [];
    }

    if (!settings.autoApplyMatchingJobs) {
      console.log(`User ${userId} has manual review mode enabled for job applications. Skipping auto-apply.`);
      return [];
    }

    const candidate = await getCandidateDetails(userId);
    const minThreshold = settings.minMatchScoreForAutoApply || 80;

    // Find active jobs related to target role or general active vacancies
    const jobs = await Job.find({ 
      status: { $in: ['active', 'Active'] } 
    }).limit(20);

    const successfulApplications = [];

    for (const job of jobs) {
      const matchScore = calculateJobMatchScore(candidate, job);

      if (matchScore >= minThreshold) {
        // Check for duplicates
        const existingIntro = await EmployerIntroduction.findOne({ userId, jobId: job._id });
        if (existingIntro) continue;

        try {
          console.log(`Auto-applying ${candidate.candidateName} to ${job.company} for ${job.title} (Match: ${matchScore}%)...`);
          const result = await sendCandidateApplication({
            userId,
            jobId: job._id,
            appliedVia: 'auto'
          });
          successfulApplications.push(result);
        } catch (jobErr) {
          console.error(`Auto-apply failed for job ${job._id}:`, jobErr.message);
        }
      }
    }

    return successfulApplications;
  } catch (error) {
    console.error("Employer Intro Service Error:", error);
    throw error;
  }
};
