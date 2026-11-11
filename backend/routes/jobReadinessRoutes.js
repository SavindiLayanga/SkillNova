import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { require2FA } from '../middleware/require2FA.js';
import { evaluateJobReadiness } from '../services/jobReadinessService.js';
import { generateCertificate } from '../services/certificateService.js';
import {
  findAndIntroduceCandidate,
  generateApplicationPreview,
  sendCandidateApplication,
  getCandidateDetails
} from '../services/employerIntroService.js';
import { JobReadiness } from '../models/JobReadiness.js';
import { Certificate } from '../models/Certificate.js';
import { EmployerIntroduction } from '../models/EmployerIntroduction.js';

const router = express.Router();

// Get Current Readiness
router.get('/', verifyAuth, require2FA, async (req, res) => {
  try {
    const readiness = await JobReadiness.findOne({ userId: req.user.uid });
    res.json(readiness || { score: 0, isJobReady: false });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Trigger Evaluation
router.post('/evaluate', verifyAuth, require2FA, async (req, res) => {
  try {
    const readiness = await evaluateJobReadiness(req.user.uid);
    
    // If just became job ready, generate certificate
    if (readiness.isJobReady) {
       let cert = await Certificate.findOne({ userId: req.user.uid });
       if (!cert) {
          const candidate = await getCandidateDetails(req.user.uid);
          const skillsToCertify = candidate.verifiedSkills.length > 0
            ? candidate.verifiedSkills.slice(0, 6)
            : ["Full-Stack Development", "Problem Solving", "Modern Technologies"];
            
          cert = await generateCertificate(req.user.uid, readiness.targetRole, readiness.score, skillsToCertify);
          readiness.certificateId = cert._id;
          await readiness.save();
       }
       
       // Trigger auto employer introductions if enabled in user settings
       await findAndIntroduceCandidate(req.user.uid);
    }
    
    res.json(readiness);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate readiness" });
  }
});

// Get Certificates
router.get('/certificates', verifyAuth, require2FA, async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Get Employer Introductions / Sent Applications
router.get('/introductions', verifyAuth, require2FA, async (req, res) => {
  try {
    const intros = await EmployerIntroduction.find({ userId: req.user.uid })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(intros);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// Get list of job IDs the user has already applied to
router.get('/applied-job-ids', verifyAuth, require2FA, async (req, res) => {
  try {
    const intros = await EmployerIntroduction.find({ userId: req.user.uid }, 'jobId status sentAt');
    const appliedIds = intros.map(i => i.jobId?.toString()).filter(Boolean);
    res.json({ appliedJobIds: appliedIds, applications: intros });
  } catch (err) {
    console.error("Error fetching applied job IDs:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Preview Application & Cover Letter before sending
router.post('/preview-application/:jobId', verifyAuth, require2FA, async (req, res) => {
  try {
    const preview = await generateApplicationPreview(req.user.uid, req.params.jobId);
    res.json(preview);
  } catch (err) {
    console.error("Preview application error:", err);
    res.status(500).json({ error: err.message || "Failed to generate application preview" });
  }
});

// Send Application with CV to Company
router.post('/apply/:jobId', verifyAuth, require2FA, async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const result = await sendCandidateApplication({
      userId: req.user.uid,
      jobId: req.params.jobId,
      customCoverLetter: coverLetter,
      appliedVia: 'manual'
    });
    res.json(result);
  } catch (err) {
    console.error("Apply to job error:", err);
    res.status(500).json({ error: err.message || "Failed to send application" });
  }
});

export default router;
