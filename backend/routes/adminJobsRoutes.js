import express from 'express';
import { 
  importJobs, 
  getJobs, 
  createJob, 
  updateJob, 
  deleteJob 
} from '../controllers/adminJobsController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const importRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many import requests, please try again after 15 minutes' }
});

router.use(authenticateAdmin);

router.post('/import', importRateLimiter, importJobs);
router.get('/', getJobs);
router.post('/', createJob);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
