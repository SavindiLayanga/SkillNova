import express from 'express';
import { verifyAuth, authenticateAdmin } from '../middleware/auth.js';
import { getCvReviews } from '../controllers/adminCvReviewsController.js';

const router = express.Router();

router.get('/', verifyAuth, authenticateAdmin, getCvReviews);

export default router;
