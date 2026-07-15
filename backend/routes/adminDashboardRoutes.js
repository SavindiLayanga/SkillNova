import express from 'express';
import { getDashboardStats } from '../controllers/adminDashboardController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/stats', getDashboardStats);

export default router;
