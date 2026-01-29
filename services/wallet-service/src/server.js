import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import walletRoutes from './routes/walletRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
app.use('/api/wallet', walletRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'Wallet Service',
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.WALLET_SERVICE_PORT || 5005;

app.listen(PORT, () => {
  console.log(`💰 Wallet Service running on port ${PORT}`);
});

export default app;
