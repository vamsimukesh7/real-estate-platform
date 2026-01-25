import express from 'express';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Booking routes will be implemented here
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Booking routes - Coming soon' });
});

export default router;
