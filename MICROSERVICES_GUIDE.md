# Real Estate Platform - Microservices Architecture with Role-Based Authentication

## 📋 Overview

This document outlines the implementation of a **microservices architecture** with **comprehensive role-based authentication (RBAC)** for the Real Estate Management Platform.

## 🏗️ Architecture

### Microservices Structure

```
Real_Estate/
├── services/
│   ├── auth-service/          (Port 5001) - Authentication & User Management
│   ├── property-service/      (Port 5002) - Property CRUD Operations
│   ├── messaging-service/     (Port 5003) - Real-time Chat & Messages
│   ├── ai-service/           (Port 5004) - AI Predictions & Analytics
│   └── api-gateway/          (Port 5000) - Unified API Gateway
├── frontend/                 (Port 5173) - React Application
└── backend/                  (Legacy - To be deprecated)
```

### Services Overview

#### 1. **Auth Service** (Port 5001)
**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Role and permission management
- Account security (locking, password reset)
- User profile management

**Key Features:**
- ✅ Role-based access control (User, Agent, Admin)
- ✅ Granular permissions system
- ✅ Account locking after failed login attempts
- ✅ Token refresh mechanism
- ✅ Email verification (placeholder)
- ✅ Password change functionality

**Roles & Permissions:**

| Role  | Permissions |
|-------|------------|
| **User** | `read:property`, `send:messages` |
| **Agent** | `create:property`, `read:property`, `update:property`, `send:messages`, `manage:bookings` |
| **Admin** | All permissions including `delete:property`, `manage:users`, `access:admin-panel` |

#### 2. **Property Service** (Port 5002)
**Responsibilities:**
- Property CRUD operations
- Property search and filtering
- Property views and saves tracking
- Featured properties management

**Required Permissions:**
- Create: `create:property` (Agent/Admin)
- Read: Public or `read:property`
- Update: `update:property` + ownership check
- Delete: `delete:property` + ownership check (Admin)

#### 3. **API Gateway** (Port 5000)
**Responsibilities:**
- Route requests to appropriate microservices
- Centralized authentication middleware
- Request/response transformation
- Load balancing (future)
- Rate limiting
- Logging and monitoring

#### 4. **Messaging Service** (Port 5003) - To be implemented
**Responsibilities:**
- Real-time chat with Socket.IO
- Message history
- Notification delivery
- Inbox management

#### 5. **AI Service** (Port 5004) - To be implemented
**Responsibilities:**
- Property price predictions
- Market analytics
- Investment scoring
- Trend analysis

## 🔐 Authentication Flow

### 1. Registration Flow
```
Frontend → API Gateway → Auth Service
                          ↓
                    Create User (with role)
                          ↓
                    Generate JWT Token
                          ↓
                    Assign Default Permissions
                          ↓
                    Return Token & User Data
```

### 2. Login Flow
```
Frontend → API Gateway → Auth Service
                          ↓
                    Validate Credentials
                          ↓
                    Check Account Status (active, locked)
                          ↓
                    Generate JWT Token (includes user ID & role)
                          ↓
                    Update Last Login
                          ↓
                    Return Token & User Data
```

### 3. Protected Request Flow
```
Frontend (with JWT) → API Gateway
                        ↓
                  Verify JWT Token
                        ↓
                  Extract User Info
                        ↓
                  Forward to Service (with user context)
                        ↓
                  Service checks permissions
                        ↓
                  Process Request & Return Response
```

## 🛡️ Authorization Middleware

### 1. `protect` - Verify Authentication
- Validates JWT token
- Checks if user exists and is active
- Checks if account is locked
- Attaches user object to request

### 2. `authorize(...roles)` - Role-Based Access
```javascript
// Example: Only Admin can access
app.get('/api/users', protect, authorize('Admin'), getUsers);

// Example: Agent or Admin can create properties
app.post('/api/properties', protect, authorize('Agent', 'Admin'), createProperty);
```

### 3. `checkPermission(...permissions)` - Permission-Based Access
```javascript
// Example: Check specific permission
app.delete('/api/properties/:id', 
  protect, 
  checkPermission('delete:property'), 
  deleteProperty
);
```

### 4. `verifyOwnershipOrAdmin` - Resource Ownership
```javascript
// Example: User can only update their own property
app.put('/api/properties/:id', 
  protect, 
  verifyOwnershipOrAdmin('owner'), 
  updateProperty
);
```

### 5. `roleBasedRateLimit` - Rate Limiting by Role
- User: 100 requests/hour
- Agent: 500 requests/hour
- Admin: 10,000 requests/hour

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Auth Service
cd services/auth-service
npm install

# Property Service
cd ../property-service
npm install

# API Gateway (to be created)
cd ../api-gateway
npm install
```

### 2. Configure Environment Variables

**Auth Service (.env):**
```env
AUTH_SERVICE_PORT=5001
MONGODB_URI=mongodb://localhost:27017/realestate-auth
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

**Property Service (.env):**
```env
PROPERTY_SERVICE_PORT=5002
MONGODB_URI=mongodb://localhost:27017/realestate-properties
AUTH_SERVICE_URL=http://localhost:5001
```

**API Gateway (.env):**
```env
PORT=5000
AUTH_SERVICE_URL=http://localhost:5001
PROPERTY_SERVICE_URL=http://localhost:5002
MESSAGING_SERVICE_URL=http://localhost:5003
AI_SERVICE_URL=http://localhost:5004
JWT_SECRET=your-super-secret-key
```

### 3. Start Services

```bash
# Terminal 1 - Auth Service
cd services/auth-service
npm run dev

# Terminal 2 - Property Service
cd services/property-service
npm run dev

# Terminal 3 - API Gateway
cd services/api-gateway
npm run dev

# Terminal 4 - Frontend
cd frontend
npm run dev
```

## 📡 API Endpoints

### Auth Service (via Gateway: `http://localhost:5000/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Protected | Get current user |
| POST | `/logout` | Protected | Logout user |
| POST | `/refresh` | Protected | Refresh token |
| PUT | `/change-password` | Protected | Change password |

### User Management (via Gateway: `http://localhost:5000/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | Get all users |
| GET | `/stats` | Admin | Get user statistics |
| GET | `/:id` | Protected | Get user by ID |
| PUT | `/profile` | Protected | Update own profile |
| PUT | `/:id/role` | Admin | Update user role |
| PUT | `/:id/permissions` | Admin | Update user permissions |
| PUT | `/:id/activate` | Admin | Activate user account |
| PUT | `/:id/deactivate` | Admin | Deactivate user account |
| DELETE | `/:id` | Admin | Delete user |

### Property Service (via Gateway: `http://localhost:5000/api/properties`)

| Method | Endpoint | Access | Required Permission |
|--------|----------|--------|-------------------|
| GET | `/` | Public | - |
| GET | `/featured` | Public | - |
| GET | `/:id` | Public | - |
| POST | `/` | Agent/Admin | `create:property` |
| PUT | `/:id` | Owner/Admin | `update:property` |
| DELETE | `/:id` | Owner/Admin | `delete:property` |
| POST | `/:id/save` | User | - |

## 🔧 Frontend Integration

### 1. Update API Base URL
```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // API Gateway
```

### 2. Role-Based UI Rendering

```jsx
import { useAuth } from './contexts/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Show to all authenticated users */}
      {user && <PropertyList />}
      
      {/* Show only to Agents and Admins */}
      {(user?.role === 'Agent' || user?.role === 'Admin') && (
        <button onClick={handleAddProperty}>Add Property</button>
      )}
      
      {/* Show only to Admins */}
      {user?.role === 'Admin' && (
        <AdminPanel />
      )}
    </div>
  );
}
```

### 3. Permission-Based Actions

```jsx
function PropertyCard({ property }) {
  const { user } = useAuth();
  
  const canEdit = user?.permissions?.includes('update:property') 
    && (property.owner === user._id || user.role === 'Admin');
    
  const canDelete = user?.permissions?.includes('delete:property')
    && user.role === 'Admin';
  
  return (
    <div>
      {/* Property details */}
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

## 🎯 Benefits of This Architecture

### Microservices Advantages:
1. **Scalability** - Scale services independently based on load
2. **Maintainability** - Easier to update and debug individual services
3. **Resilience** - Failure in one service doesn't crash entire system
4. **Technology Flexibility** - Different services can use different tech stacks
5. **Team Autonomy** - Different teams can work on different services

### RBAC Advantages:
1. **Security** - Fine-grained access control
2. **Flexibility** - Easy to add/modify roles and permissions
3. **Audit Trail** - Track who did what
4. **User Management** - Centralized user administration
5. **Account Protection** - Automatic locking after failed attempts

## 🔄 Migration from Monolith

1. **Phase 1** ✅ - Set up Auth Service
2. **Phase 2** ✅ - Set up Property Service  
3. **Phase 3** - Create API Gateway
4. **Phase 4** - Update Frontend to use Gateway
5. **Phase 5** - Add Messaging & AI Services
6. **Phase 6** - Deprecate old backend

## 📊 Monitoring & Logging

Each service should log:
- Request/Response times
- Error rates
- Authentication failures
- Permission denials
- Service health status

## 🔒 Security Best Practices

1. ✅ Use HTTPS in production
2. ✅ Store JWT secrets in environment variables
3. ✅ Implement rate limiting
4. ✅ Validate all inputs
5. ✅ Hash passwords with bcrypt
6. ✅ Lock accounts after failed attempts
7. ✅ Implement token expiration
8. ✅ Use role-based access control
9. ⏳ Add API key authentication between services
10. ⏳ Implement request signing

## 📝 Next Steps

1. ✅ Complete API Gateway implementation
2. Create Messaging Service
3. Create AI Service
4. Update Frontend to use Gateway
5. Add inter-service authentication
6. Implement service discovery
7. Add Docker containers
8. Set up CI/CD pipeline
9. Deploy to cloud (AWS/Azure/GCP)
10. Add monitoring (Prometheus/Grafana)

## 🤝 Contributing

When adding new features:
1. Identify which service it belongs to
2. Check required permissions
3. Update API Gateway routes
4. Update frontend AuthContext
5. Test with different roles
6. Update documentation

---

**Status:** Auth Service & Property Service implemented ✅  
**Next:** API Gateway implementation 🚀
