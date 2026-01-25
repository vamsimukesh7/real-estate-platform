import express from 'express';
import { register, login, getMe, updateProfile, getSavedProperties, updatePassword } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (auth endpoints)
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
router.put('/profile', protect, updateProfile);
router.get('/saved-properties', protect, getSavedProperties);
router.put('/update-password', protect, updatePassword);

export default router;
