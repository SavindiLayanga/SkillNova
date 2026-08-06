import express from "express";
import { verifyAuth } from "../middleware/auth.js";
import { require2FA } from "../middleware/require2FA.js";
import {
  getUserSkillTests,
  getLibraryTests,
  generateMoreLibraryTests,
  getLibraryTestById,
  completeLibraryTest,
  submitSkillTest,
  generateSkillTest
} from "../controllers/skillTestController.js";

const router = express.Router();

// General User Skill Tests
router.get("/user/skill-tests", verifyAuth, require2FA, getUserSkillTests);
router.post("/user/skill-tests/:id/submit", verifyAuth, require2FA, submitSkillTest);

// Skill Test Library
router.get("/skill-tests/library/:skill", verifyAuth, require2FA, getLibraryTests);
router.get("/skill-tests/library/test/:id", verifyAuth, require2FA, getLibraryTestById);
router.put("/skill-tests/library/:id/complete", verifyAuth, require2FA, completeLibraryTest);
router.post("/skill-tests/library/generate-more", verifyAuth, require2FA, generateMoreLibraryTests);

// Generate General Skill Test
router.post("/generate-test", verifyAuth, require2FA, generateSkillTest);

export default router;
