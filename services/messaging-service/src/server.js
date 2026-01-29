import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import messageRoutes from './routes/messageRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database Connection
connectDB();

// Routes
app.use('/api/messages', messageRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'Messaging Service',
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected to Messaging Service:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from Messaging Service:', socket.id);
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.MESSAGING_SERVICE_PORT || 5003;

httpServer.listen(PORT, () => {
  console.log(`💬 Messaging Service running on port ${PORT}`);
});

export { io };
