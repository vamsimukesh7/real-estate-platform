import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import propertyRoutes from './routes/propertyRoutes.js';
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
app.use('/api/properties', propertyRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'Property Service',
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PROPERTY_SERVICE_PORT || 5002;

app.listen(PORT, () => {
  console.log(`🏠 Property Service running on port ${PORT}`);
});

export default app;
