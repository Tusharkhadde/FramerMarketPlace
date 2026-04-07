import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser
} from '../controllers/admin.controller.js';

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
