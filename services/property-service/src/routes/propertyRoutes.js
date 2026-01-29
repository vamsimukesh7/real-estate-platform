import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleSaveProperty,
  getFeaturedProperties,
  blockProperty,
  unblockProperty,
  getAnalyticsDashboard,
  buyProperty,
  approveBuy,
  getMyProperties,
} from '../controllers/propertyController.js';
import { protect, authorize, checkPermission, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (with optional auth to check for saved status)
router.get('/', optionalAuth, getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/analytics', protect, authorize('Admin'), getAnalyticsDashboard);
router.get('/my-properties', protect, authorize('Buyer'), getMyProperties); // Restricted to Buyer
router.get('/:id', getProperty);

// Protected routes - Seller, Agent and Admin can create
router.post('/', protect, authorize('Seller', 'Agent', 'Admin'), createProperty);

// Protected routes - Owner or Admin can update/delete
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, authorize('Seller', 'Agent', 'Admin'), deleteProperty);

// Protected routes - Any authenticated user can save
router.post('/:id/save', protect, toggleSaveProperty);

// Admin-only routes for blocking properties
router.put('/:id/block', protect, authorize('Admin'), blockProperty);
router.put('/:id/unblock', protect, authorize('Admin'), unblockProperty);

// Purchase flow
router.post('/:id/buy', protect, authorize('Buyer'), buyProperty);
router.post('/:id/approve', protect, authorize('Seller', 'Agent', 'Admin'), approveBuy);

export default router;
