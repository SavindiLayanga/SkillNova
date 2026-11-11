import express from 'express';
import { Certificate } from '../models/Certificate.js';

const router = express.Router();

router.get('/verify-certificate/:certificateId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId });
    if (!cert) {
      return res.status(404).json({ valid: false, message: "Certificate not found" });
    }
    
    // Return safe data
    res.json({
      valid: true,
      certificateId: cert.certificateId,
      candidateName: cert.name,
      targetRole: cert.targetRole,
      readinessScore: cert.jobReadinessScore,
      verifiedSkills: cert.skillsCompleted,
      issueDate: cert.issueDate,
      status: "Valid"
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
