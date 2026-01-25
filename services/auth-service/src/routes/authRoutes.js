import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  verifyEmail,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);
router.put('/change-password', protect, changePassword);

export default router;
