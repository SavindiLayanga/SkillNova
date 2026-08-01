import express from 'express';
import { getJobMatches, getCourseMatches, sendCourseRecommendations } from '../controllers/userMatchesController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Both routes require the user to be authenticated
router.use(verifyAuth);

router.get('/jobs', getJobMatches);
router.get('/courses', getCourseMatches);
router.post('/courses/send-email', sendCourseRecommendations);

export default router;
