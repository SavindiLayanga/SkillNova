import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { getCvReviews } from '../controllers/adminCvReviewsController.js';

const router = express.Router();

router.get('/', authenticateAdmin, getCvReviews);

export default router;
