# Microservices Startup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017 or MongoDB Atlas)
- npm or yarn

## Quick Start

### Option 1: Start All Services Individually

#### 1. Start Auth Service
```powershell
cd services/auth-service
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```
Service will run on: http://localhost:5001

#### 2. Start Property Service
```powershell
cd services/property-service
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```
Service will run on: http://localhost:5002

#### 3. Start API Gateway
```powershell
cd services/api-gateway
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```
Gateway will run on: http://localhost:5000

#### 4. Start Frontend
```powershell
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

### Option 2: Use Startup Scripts

We've created convenient scripts to start all services:

**Windows (PowerShell):**
```powershell
.\start-services.ps1
```

**Linux/Mac:**
```bash
chmod +x start-services.sh
./start-services.sh
```

## Service URLs

When all services are running:

- **API Gateway**: http://localhost:5000 (Use this in frontend)
- **Auth Service**: http://localhost:5001
- **Property Service**: http://localhost:5002
- **Frontend**: http://localhost:5173

## Testing the Setup

### 1. Check Service Health
```powershell
# Check gateway
curl http://localhost:5000/health

# Check services status
curl http://localhost:5000/services/status
```

### 2. Test Authentication
```powershell
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Property Access
```powershell
# Get properties (public)
curl http://localhost:5000/api/properties

# Create property (requires Agent/Admin role)
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Property",
    "price": 500000,
    "location": "Test City",
    "type": "House",
    "beds": 3,
    "baths": 2,
    "sqft": 2000
  }'
```

## Frontend Configuration

Update your frontend API configuration:

```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // API Gateway
```

## User Roles & Permissions

### Default Test Users

You can create test users with different roles:

#### Regular User
```json
{
  "role": "User",
  "permissions": ["read:property", "send:messages"]
}
```

#### Agent
```json
{
  "role": "Agent",
  "permissions": [
    "create:property",
    "read:property",
    "update:property",
    "send:messages",
    "manage:bookings"
  ]
}
```

#### Admin
```json
{
  "role": "Admin",
  "permissions": [
    "create:property",
    "read:property",
    "update:property",
    "delete:property",
    "manage:users",
    "manage:bookings",
    "manage:analytics",
    "send:messages",
    "access:admin-panel"
  ]
}
```

## Troubleshooting

### Service Won't Start
1. Check if MongoDB is running
2. Verify port is not already in use
3. Check .env configuration
4. Review error logs in terminal

### Authentication Issues
1. Verify JWT_SECRET matches across services
2. Check token expiration
3. Ensure user has correct role/permissions

### Database Connection Failed
1. Check MongoDB is running: `mongod --version`
2. Verify MONGODB_URI in .env
3. Check firewall/network settings

## Development Tips

### Stopping Services
Press `Ctrl+C` in each terminal to stop services

### Viewing Logs
Each service logs to its terminal. Check for:
- 🚀 Server started successfully
- 📦 MongoDB connected
- ❌ Errors and stack traces

### Database Management

View users in MongoDB:
```javascript
// In MongoDB shell
use realestate-auth
db.users.find().pretty()
```

View properties:
```javascript
use realestate-properties
db.properties.find().pretty()
```

## Next Steps

1. ✅ All services running
2. Create test users with different roles
3. Test role-based access control
4. Implement messaging service
5. Implement AI service
6. Deploy to production

## Production Deployment

For production deployment:
1. Use environment-specific .env files
2. Enable HTTPS
3. Use production MongoDB (MongoDB Atlas)
4. Implement proper logging (Winston, Loggly)
5. Add monitoring (PM2, New Relic)
6. Set up reverse proxy (Nginx)
7. Use process manager (PM2)
8. Enable rate limiting
9. Implement caching (Redis)
10. Set up CI/CD pipeline

See DEPLOYMENT.md for detailed production setup.
