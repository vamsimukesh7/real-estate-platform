# 🚀 Quick Start - Microservices & RBAC

## ⚡ Fastest Way to Get Started

### 1. Install Dependencies (One Command)
```powershell
# Windows
.\install-dependencies.ps1

# Linux/Mac
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### 2. Start All Services (One Command)
```powershell
# Windows
.\start-services.ps1

# Linux/Mac
chmod +x start-services.sh
./start-services.sh
```

### 3. Open Your Browser
- Frontend: http://localhost:5173
- API Gateway: http://localhost:5000

## 📋 What You Get

### ✅ Microservices
- **Auth Service** (Port 5001) - User authentication & management
- **Property Service** (Port 5002) - Property operations
- **API Gateway** (Port 5000) - Unified API endpoint

### ✅ Role-Based Authentication
- **User** - Can view and save properties
- **Agent** - Can create and manage properties
- **Admin** - Full system access

### ✅ Security Features
- JWT authentication
- Account locking (5 failed attempts)
- Password hashing
- Role & permission-based access
- Token refresh

## 🎯 Test It Out

### Register as an Agent
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Agent",
    "email": "agent@example.com",
    "password": "password123",
    "role": "Agent"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

### Create a Property (Use token from login)
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Modern Villa",
    "price": 1250000,
    "location": "Malibu, CA",
    "type": "House",
    "beds": 4,
    "baths": 3,
    "sqft": 3500
  }'
```

## 📚 Documentation

- **IMPLEMENTATION_SUMMARY.md** - What's been implemented
- **MICROSERVICES_GUIDE.md** - Complete architecture guide
- **MICROSERVICES_STARTUP.md** - Detailed startup instructions

## 🆘 Troubleshooting

**Services won't start?**
- Check MongoDB is running: `mongod --version`
- Verify ports 5000, 5001, 5002 are free
- Check .env files exist in each service folder

**Can't login?**
- Check JWT_SECRET matches in all .env files
- Verify user credentials are correct
- Check auth service is running on port 5001

**Can't create properties?**
- Ensure you're logged in as Agent or Admin
- Include Authorization header with JWT token
- Check property service is running on port 5002

## 🎨 Frontend Integration

Update your frontend API URL:

```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // API Gateway
```

Use role-based UI:
```jsx
const { user } = useAuth();

// Show to Agents and Admins only
{(user?.role === 'Agent' || user?.role === 'Admin') && (
  <button onClick={handleAddProperty}>Add Property</button>
)}

// Show to Admins only
{user?.role === 'Admin' && (
  <AdminPanel />
)}
```

## 🔥 Key Features

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Complete |
| Role-Based Access | ✅ Complete |
| Permission System | ✅ Complete |
| Account Locking | ✅ Complete |
| API Gateway | ✅ Complete |
| Auth Service | ✅ Complete |
| Property Service | ✅ Base Setup |
| Auto-start Scripts | ✅ Complete |
| Documentation | ✅ Complete |

---

**Ready to build?** Start the services and you're good to go! 🚀

For detailed information, see the complete documentation files.
