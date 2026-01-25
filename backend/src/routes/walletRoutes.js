import express from 'express';
import { getWalletData, depositFunds, withdrawFunds } from '../controllers/walletController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getWalletData);
router.post('/deposit', depositFunds);
router.post('/withdraw', withdrawFunds);

export default router;
