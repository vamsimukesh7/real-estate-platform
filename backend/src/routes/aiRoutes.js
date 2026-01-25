import express from 'express';
import {
  getPricePrediction,
  getInvestmentScore,
  getMarketTrend,
  getDemandScore,
  updatePropertyPredictions,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/predict-price', getPricePrediction);
router.post('/investment-score', getInvestmentScore);
router.get('/market-trend', getMarketTrend);
router.get('/demand-score', getDemandScore);
router.post('/update-property/:id', protect, authorize('Admin'), updatePropertyPredictions);

export default router;
