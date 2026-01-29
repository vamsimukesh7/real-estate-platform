# Real Estate Platform - Microservices Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                          │
│                         http://localhost:5173                            │
│                                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Dashboard  │  │  Properties  │  │   Inbox    │  │  Analytics   │  │
│  │             │  │              │  │            │  │              │  │
│  └─────────────┘  └──────────────┘  └────────────┘  └──────────────┘  │
│                                                                          │
│  Role-Based UI Components:                                              │
│  • User: View & Save Properties                                         │
│  • Agent: + Create & Manage Listings                                    │
│  • Admin: + User Management & Full Access                               │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ + JWT Token
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Express)                             │
│                        http://localhost:5000                             │
│                                                                          │
│  Features:                                                               │
│  ✓ JWT Token Validation                                                 │
│  ✓ Request Routing to Services                                          │
│  ✓ Service Health Monitoring                                            │
│  ✓ Centralized Logging                                                  │
│  ✓ Load Balancing (Future)                                              │
│                                                                          │
│  Routes:                                                                 │
│  • /api/auth/* → Auth Service                                           │
│  • /api/users/* → Auth Service                                          │
│  • /api/properties/* → Property Service                                 │
│  • /api/messages/* → Messaging Service                                  │
│  • /api/ai/* → AI Service                                               │
└──────┬──────────────┬─────────────────┬──────────────┬─────────────────┘
       │              │                 │              │
       │              │                 │              │
       ▼              ▼                 ▼              ▼
┌──────────────┐ ┌───────────────┐ ┌──────────────┐ ┌─────────────┐
│ AUTH SERVICE │ │PROPERTY SERVICE│ │MSG SERVICE   │ │ AI SERVICE  │
│ Port: 5001   │ │ Port: 5002    │ │ Port: 5003   │ │ Port: 5004  │
│              │ │               │ │              │ │             │
│ Controllers: │ │ Controllers:  │ │ (Future)     │ │ (Future)    │
│ • Auth       │ │ • Properties  │ │              │ │             │
│ • Users      │ │ • Search      │ │ • Chat       │ │ • Predict   │
│              │ │ • Filters     │ │ • Notifs     │ │ • Analytics │
│ Features:    │ │               │ │              │ │             │
│ ✓ Register   │ │ Features:     │ │              │ │             │
│ ✓ Login      │ │ ✓ CRUD        │ │              │ │             │
│ ✓ JWT Gen    │ │ ✓ Search      │ │              │ │             │
│ ✓ Roles      │ │ ✓ Filter      │ │              │ │             │
│ ✓ Permissions│ │ ✓ Save/View   │ │              │ │             │
│ ✓ Lock/Unlock│ │               │ │              │ │             │
└──────┬───────┘ └───────┬───────┘ └──────────────┘ └─────────────┘
       │                 │
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  MongoDB     │  │  MongoDB     │
│  realestate  │  │  realestate  │
│  -auth       │  │  -properties │
│              │  │              │
│ Collections: │  │ Collections: │
│ • users      │  │ • properties │
└──────────────┘  └──────────────┘


═══════════════════════════════════════════════════════════════════════════

AUTHENTICATION FLOW:

1. USER REGISTRATION
   Frontend → Gateway → Auth Service → MongoDB
   
   Request:
   POST /api/auth/register
   {
     "name": "John Agent",
     "email": "agent@example.com",
     "password": "password123",
     "role": "Agent"
   }
   
   Response:
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1...",
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
       ]
     }
   }

2. USER LOGIN
   Frontend → Gateway → Auth Service
                          ↓
                    • Verify Credentials
                    • Check Account Status
                    • Check Lock Status
                    • Generate JWT Token
                    • Update Last Login
                          ↓
                    Return Token + User Data

3. PROTECTED REQUEST (e.g., Create Property)
   Frontend (with JWT) → Gateway
                          ↓
                    Verify JWT Token
                    Extract User Info
                          ↓
                    Forward to Property Service
                          ↓
                    Check user.role = Agent/Admin
                    Check user.permissions includes 'create:property'
                          ↓
                    Create Property → MongoDB
                          ↓
                    Return Success

═══════════════════════════════════════════════════════════════════════════

ROLE-BASED ACCESS CONTROL:

┌──────────────────────────────────────────────────────────────────────────┐
│                              USER ROLES                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  👤 USER (Default)                                                        │
│  ├─ Permissions:                                                          │
│  │  • read:property                                                       │
│  │  • send:messages                                                       │
│  ├─ Can Do:                                                               │
│  │  ✓ Browse properties                                                   │
│  │  ✓ Save/favorite properties                                            │
│  │  ✓ Send messages                                                       │
│  │  ✓ View property details                                               │
│  └─ Cannot:                                                               │
│     ✗ Create properties                                                   │
│     ✗ Manage listings                                                     │
│     ✗ Access admin features                                               │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  🏢 AGENT                                                                 │
│  ├─ Permissions:                                                          │
│  │  • create:property                                                     │
│  │  • read:property                                                       │
│  │  • update:property                                                     │
│  │  • send:messages                                                       │
│  │  • manage:bookings                                                     │
│  ├─ Can Do:                                                               │
│  │  ✓ All User permissions                                                │
│  │  ✓ Create property listings                                            │
│  │  ✓ Update own listings                                                 │
│  │  ✓ Manage bookings                                                     │
│  │  ✓ View analytics for own properties                                   │
│  └─ Cannot:                                                               │
│     ✗ Delete properties                                                   │
│     ✗ Manage users                                                        │
│     ✗ Access admin panel                                                  │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  👑 ADMIN                                                                 │
│  ├─ Permissions:                                                          │
│  │  • ALL PERMISSIONS                                                     │
│  │  (create, read, update, delete:property)                               │
│  │  (manage:users, bookings, analytics)                                   │
│  │  (send:messages, access:admin-panel)                                   │
│  ├─ Can Do:                                                               │
│  │  ✓ All Agent permissions                                               │
│  │  ✓ Delete any property                                                 │
│  │  ✓ Manage all users                                                    │
│  │  ✓ Change user roles                                                   │
│  │  ✓ Activate/deactivate accounts                                        │
│  │  ✓ View all analytics                                                  │
│  │  ✓ Access admin panel                                                  │
│  └─ Full System Access                                                    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

SECURITY FEATURES:

┌─────────────────────────┐
│   JWT TOKEN STRUCTURE   │
├─────────────────────────┤
│ Header:                 │
│  {                      │
│    "alg": "HS256",      │
│    "typ": "JWT"         │
│  }                      │
│                         │
│ Payload:                │
│  {                      │
│    "id": "user_id",     │
│    "role": "Agent",     │
│    "iat": timestamp,    │
│    "exp": timestamp     │
│  }                      │
│                         │
│ Signature:              │
│  HMACSHA256(            │
│    base64(header) + "." │
│    base64(payload),     │
│    JWT_SECRET           │
│  )                      │
└─────────────────────────┘

Account Security:
• ✅ Password hashing (bcrypt, 10 rounds)
• ✅ Failed login tracking
• ✅ Auto-lock after 5 failed attempts (30 min)
• ✅ Active/inactive status
• ✅ Email verification (placeholder)
• ✅ Last login tracking
• ✅ Token expiration (30 days)

═══════════════════════════════════════════════════════════════════════════

DEPLOYMENT TOPOLOGY (Production):

                              [Load Balancer]
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              [Gateway 1]     [Gateway 2]     [Gateway 3]
                    │               │               │
         ┌──────────┼──────────┬────┼────┬──────────┼──────────┐
         │          │          │         │          │          │
   [Auth 1-N]  [Prop 1-N]  [Msg 1-N]  [AI 1-N]    ...       ...
         │          │          │         │
    [MongoDB]  [MongoDB]  [MongoDB]  [MongoDB]
    Replica    Replica    Replica    Replica
     Set        Set        Set        Set

Features:
• Horizontal scaling
• Service redundancy
• Database replication
• Auto-failover
• Health monitoring
• Load balancing

═══════════════════════════════════════════════════════════════════════════
```
