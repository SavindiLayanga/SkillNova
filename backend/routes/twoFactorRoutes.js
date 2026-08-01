import express from "express";
import rateLimit from "express-rate-limit";
import { setup2FA, verify2FA, disable2FA, validateSession } from "../controllers/twoFactorController.js";
import { verifyToken } from "../middleware/auth.js"; // Assuming verifyToken is standard firebase verify

const router = express.Router();

// Rate limiting for verify & validate-session (5 attempts / 5 minutes)
const twoFactorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: "Too many verification attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// All 2FA routes require the user to be authenticated via Firebase
router.use(verifyToken);

router.post("/setup", setup2FA);
router.post("/verify", twoFactorLimiter, verify2FA);
router.post("/disable", disable2FA);
router.post("/validate-session", twoFactorLimiter, validateSession);

export default router;
