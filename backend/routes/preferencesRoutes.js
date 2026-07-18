import express from "express";
import { getPreferences, updatePreferences } from "../controllers/preferencesController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyAuth, getPreferences);
router.put("/", verifyAuth, updatePreferences);

export default router;
