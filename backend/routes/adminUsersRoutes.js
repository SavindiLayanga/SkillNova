import express from 'express';
import { 
  getAllUsers, 
  getUserDetails, 
  updateUserStatus, 
  updateUser, 
  deleteUser 
} from '../controllers/adminUsersController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserDetails);
router.patch('/:id/status', updateUserStatus);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
