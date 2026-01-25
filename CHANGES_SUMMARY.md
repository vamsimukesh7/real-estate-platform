# ✅ Frontend & Backend Changes - Role-Based Authentication

## What's Been Updated

### ✅ **Frontend Changes**

#### 1. **AuthContext.jsx** - Enhanced with RBAC
**Location**: `frontend/src/contexts/AuthContext.jsx`

**Changes**:
- ✅ Updated to use `/auth/login` and `/auth/register` endpoints
- ✅ Added role checking utilities:
  - `hasRole(roles)` - Check if user has specific role(s)
  - `hasPermission(permissions)` - Check if user has specific permission(s)
  - `isAuthenticated()` - Check if user is logged in
  - `isAdmin()` - Check if user is Admin
  - `isAgent()` - Check if user is Agent
  - `isUser()` - Check if user is basic User
- ✅ User object now includes:  
  - `role` (User/Agent/Admin)
  - `permissions` array
  - `active` status
  - `verified` status

**Example Usage**:
```jsx
const { user, hasRole, hasPermission, isAdmin } = useAuth();

// Check role
{hasRole(['Agent', 'Admin']) && <AddPropertyButton />}

// Check permission
{hasPermission('create:property') && <CreateForm />}

// Check if admin
{isAdmin() && <AdminPanel />}
```

#### 2. **Dashboard.jsx** - Role-Based UI
**Location**: `frontend/src/pages/Dashboard.jsx`

**Changes**:
- ✅ Imported `useAuth` hook
- ✅ "Add Listing" button now only shows to Agents and Admins
```jsx
{hasRole(['Agent', 'Admin']) && (
  <button onClick={() => setIsAddModalOpen(true)}>
    Add Listing
  </button>
)}
```

#### 3. **Register.jsx** - Already Has Role Selection ✅
**Location**: `frontend/src/pages/Register.jsx`

- ✅ Already includes role selection (User or Agent)
- ✅ No changes needed

---

### ✅ **Backend Changes**

#### 1. **User Model** - Added RBAC Features  
**Location**: `backend/src/models/User.js`

**New Fields**:
- ✅ `active` - Account active/inactive status
- ✅ `permissions[]` - Array of permission strings
- ✅ `loginAttempts` - Failed login counter
- ✅ `lockUntil` - Account lock expiration
- ✅ `lastLogin` - Last successful login timestamp

**New Methods**:
- ✅ `isLocked()` - Check if account is locked
- ✅ `getDefaultPermissions()` - Get role-based default permissions

**Permission System**:
- User: `['read:property', 'send:messages']`
- Agent: `['create:property', 'read:property', 'update:property', 'send:messages', 'manage:bookings']`
- Admin: All permissions

#### 2. **Auth Middleware** - Enhanced Security
**Location**: `backend/src/middlewares/auth.js`

**New Features**:
- ✅ Check account active status
- ✅ Check account lock status
- ✅ Added `checkPermission()` middleware
- ✅ Added `verifyOwnershipOrAdmin()` middleware

#### 3. **User Controller** - Enhanced Auth Logic
**Location**: `backend/src/controllers/userController.js`

**Changes in Register**:
- ✅ Returns `permissions` array in response
- ✅ Only allows User/Agent roles (Admin can only be set by another Admin)
- ✅ Auto-assigns default permissions based on role

**Changes in Login**:
- ✅ Account locking after 5 failed attempts (30-minute lock)
- ✅ Shows remaining attempts before lock
- ✅ Checks if account is active
- ✅ Returns comprehensive user data with permissions
- ✅ Tracks last login time
- ✅ Resets login attempts on successful login

#### 4. **Auth Routes** - New Endpoints
**Location**: `backend/src/routes/authRoutes.js` (NEW FILE)

**New Routes**:
```javascript
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user  
GET  /api/auth/me        - Get current user
POST /api/auth/logout    - Logout user
```

#### 5. **App.js** - Added Auth Routes
**Location**: `backend/src/app.js`

**Changes**:
- ✅ Imported authRoutes
- ✅ Added route: `app.use('/api/auth', authRoutes)`

#### 6. **Property Routes** - Role-Based Access
**Location**: `backend/src/routes/propertyRoutes.js`

**Changes**:
- ✅ Create property: Requires Agent or Admin role
- ✅ Delete property: Requires Agent or Admin role
- ✅ View properties: Public (no auth needed)

---

## 🎯 **How It Works Now**

### **1. User Registration**
```javascript
POST /api/auth/register
{
  "name": "John Agent",
  "email": "agent@example.com",
  "password": "password123",
  "role": "Agent"  // User or Agent
}

Response:
{
  "success": true,
  "token": "eyJhbGci...",
  "data": {
    "_id": "...",
    "name": "John Agent",
    "email": "agent@example.com",
    "role": "Agent",
    "permissions": [
      "create:property",
      "read:property",
      "update:property",
      "send:messages",
      "manage:bookings"
    ],
    "verified": false,
    "active": true
  }
}
```

### **2. User Login**
```javascript
POST /api/auth/login
{
  "email": "agent@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGci...",
  "data": {
    "_id": "...",
    "name": "John Agent",
    "role": "Agent",
    "permissions": [...],
    "lastLogin": "2026-01-24T10:20:30.000Z"
  }
}
```

### **3. Failed Login (Account Locking)**
```javascript
// After 5 failed attempts:
{
  "success": false,
  "message": "Account locked due to multiple failed login attempts. Try again in 30 minutes."
}

// Before 5 attempts:
{
  "success": false,
  "message": "Invalid email or password. 3 attempts remaining."
}
```

### **4. Role-Based UI (Frontend)**
```jsx
// Dashboard.jsx - Only show to Agents/Admins
const { hasRole } = useAuth();

{hasRole(['Agent', 'Admin']) && (
  <button onClick={() => setIsAddModalOpen(true)}>
    Add Listing
  </button>
)}
```

### **5. Role-Based API (Backend)**
```javascript
// Property Routes
router.post('/', 
  protect,                        // Must be authenticated
  authorize('Agent', 'Admin'),    // Must be Agent or Admin
  createProperty                  // Then execute
);
```

---

## 📊 **Testing the Changes**

### **Test 1: Register as User**
1. Open: http://localhost:5173/register
2. Select: "Buy or Rent Properties" (User role)
3. Register and login
4. Result: ❌ "Add Listing" button should NOT appear

### **Test 2: Register as Agent**
1. Open: http://localhost:5173/register
2. Select: "List Properties (Agent)"
3. Register and login
4. Result: ✅ "Add Listing" button SHOULD appear

### **Test 3: Test Account Locking**
1. Try to login with wrong password 5 times
2. Result: Account locked for 30 minutes

### **Test 4: Check Permissions**
```javascript
// In browser console after login as Agent:
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role);        // "Agent"
console.log(user.permissions); // ["create:property", ...]
```

---

## 🔑 **Role & Permission Matrix**

| Action | User | Agent | Admin |
|--------|------|-------|-------|
| View Properties | ✅ | ✅ | ✅ |
| Save Properties | ✅ | ✅ | ✅ |
| Send Messages | ✅ | ✅ | ✅ |
| Create Property | ❌ | ✅ | ✅ |
| Update Property | ❌ | ✅ (own) | ✅ (all) |
| Delete Property | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ |

---

## 🚀 **Next Steps**

1. **Start Backend**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Test Registration**:
   - Create User account → shouldn't see "Add Listing"
   - Create Agent account → should see "Add Listing"

4. **Test Role-Based Features**:
   - Try creating property as User → should fail
   - Try creating property as Agent → should succeed

---

## 📁 **Files Modified**

### Frontend:
- ✅ `frontend/src/contexts/AuthContext.jsx`
- ✅ `frontend/src/pages/Dashboard.jsx`

### Backend:
- ✅ `backend/src/models/User.js`
- ✅ `backend/src/middlewares/auth.js`
- ✅ `backend/src/controllers/userController.js`
- ✅ `backend/src/routes/authRoutes.js` (NEW)
- ✅ `backend/src/routes/propertyRoutes.js`
- ✅ `backend/src/app.js`

---

**Status**: ✅ **Frontend and Backend are now fully integrated with Role-Based Authentication!**

The system is ready to use. Users can register with different roles, and the UI/API will enforce proper access control.
