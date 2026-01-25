import express from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  updateUserPermissions,
  deactivateUser,
  activateUser,
  deleteUser,
  getUserStats,
} from '../controllers/userController.js';
import { protect, authorize, checkPermission } from '../middlewares/auth.js';

const router = express.Router();

// User profile routes
router.get('/me', protect, getUserById);
router.put('/profile', protect, updateProfile);

// Admin-only routes
router.get('/', protect, authorize('Admin'), getUsers);
router.get('/stats', protect, authorize('Admin'), getUserStats);
router.get('/:id', protect, getUserById);

router.put('/:id/role', protect, authorize('Admin'), updateUserRole);
router.put('/:id/permissions', protect, authorize('Admin'), updateUserPermissions);
router.put('/:id/deactivate', protect, authorize('Admin'), deactivateUser);
router.put('/:id/activate', protect, authorize('Admin'), activateUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

export default router;
