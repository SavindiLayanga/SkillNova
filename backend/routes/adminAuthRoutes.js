import express from 'express';
import rateLimit from 'express-rate-limit';
import { adminLogin, adminLogout, getAdminMe } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true // Don't count successful logins against the limit
});

router.post('/login', loginLimiter, adminLogin);
router.post('/logout', adminLogout);
router.get('/me', authenticateAdmin, getAdminMe);

export default router;
