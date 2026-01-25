import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  property: process.env.PROPERTY_SERVICE_URL || 'http://localhost:5002',
  messaging: process.env.MESSAGING_SERVICE_URL || 'http://localhost:5003',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:5004',
};

// Authentication middleware for gateway
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Allow request to pass through - individual services will handle auth
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'API Gateway',
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      auth: services.auth,
      property: services.property,
      messaging: services.messaging,
      ai: services.ai,
    }
  });
});

// Service status endpoint
app.get('/services/status', async (req, res) => {
  const serviceStatus = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(`${url}/health`);
      serviceStatus[name] = {
        url,
        status: response.ok ? 'UP' : 'DOWN',
        statusCode: response.status
      };
    } catch (error) {
      serviceStatus[name] = {
        url,
        status: 'DOWN',
        error: error.message
      };
    }
  }
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: serviceStatus
  });
});

// Proxy configuration options
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Remove /api prefix and service name from path
    return path.replace(/^\/api\/[^\/]+/, '/api');
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user information if authenticated
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      service: target
    });
  },
  logLevel: 'silent'
});

// Route to services
app.use('/api/auth', authenticateToken, createProxyMiddleware(proxyOptions(services.auth)));
app.use('/api/users', authenticateToken, createProxyMiddleware(proxyOptions(services.auth)));
app.use('/api/properties', authenticateToken, createProxyMiddleware(proxyOptions(services.property)));
app.use('/api/messages', authenticateToken, createProxyMiddleware(proxyOptions(services.messaging)));
app.use('/api/ai', authenticateToken, createProxyMiddleware(proxyOptions(services.ai)));

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal gateway error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log(`📡 Routing to services:`);
  console.log(`   ├── Auth Service: ${services.auth}`);
  console.log(`   ├── Property Service: ${services.property}`);
  console.log(`   ├── Messaging Service: ${services.messaging}`);
  console.log(`   └── AI Service: ${services.ai}`);
});

export default app;
