import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  getSavedProperties,
  getNotifications,
  markNotificationsRead,
  updatePassword,
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/saved-properties', protect, getSavedProperties);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.put('/update-password', protect, updatePassword);

export default router;
