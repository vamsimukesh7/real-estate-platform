import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import aiRoutes from './routes/aiRoutes.js';
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
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'AI Service',
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.AI_SERVICE_PORT || 5004;

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
});

export default app;
