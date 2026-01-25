# Role-Based Authentication System

## Overview
The Real Estate platform now implements a comprehensive role-based authentication system with three distinct roles: **Buyer**, **Seller**, and **Admin**.

## Roles & Permissions

### 1. 👤 Buyer Role
**Purpose**: For users looking to find and rent/buy properties

**Permissions**:
- `read:property` - Can view all properties
- `send:messages` - Can message sellers/agents

**Dashboard Access**:
- ✅ **Buy Tab** - Browse properties for sale
- ✅ **Rent Tab** - Browse properties for rent
- ✅ **Compare Tab** - Compare properties side-by-side
- ❌ **Sell Tab** - NOT accessible
- ❌ **Stats Cards** - NOT visible (Total Properties, Revenue, Views, Growth)
- ❌ **Add Listing Button** - NOT visible

---

### 2. 🏢 Seller Role
**Purpose**: For property owners and agents who want to list properties

**Permissions**:
- `create:property` - Can create new property listings
- `read:property` - Can view all properties
- `update:property` - Can update their own properties
- `send:messages` - Can message buyers
- `manage:bookings` - Can manage property bookings

**Dashboard Access**:
- ❌ **Buy Tab** - NOT accessible
- ❌ **Rent Tab** - NOT accessible
- ✅ **Sell Tab** - Manage their active listings
- ❌ **Compare Tab** - NOT accessible
- ❌ **Stats Cards** - NOT visible
- ✅ **Add Listing Button** - Visible for creating new properties

---

### 3. 👑 Admin Role
**Purpose**: Platform administrators with full access

**Permissions**:
- `create:property` - Can create properties
- `read:property` - Can view all properties
- `update:property` - Can update any property
- `delete:property` - Can delete any property
- `manage:users` - Can manage all users
- `manage:bookings` - Can manage all bookings
- `manage:analytics` - Can access platform analytics
- `send:messages` - Can message anyone
- `access:admin-panel` - Can access admin dashboard

**Dashboard Access**:
- ✅ **Buy Tab** - Full access
- ✅ **Rent Tab** - Full access
- ✅ **Sell Tab** - Full access
- ✅ **Compare Tab** - Full access
- ✅ **Stats Cards** - Fully visible with live calculations:
  - **Total Properties**: Dynamic count from database
  - **Total Revenue**: Calculated from sold properties
  - **Property Views**: Aggregated from all property views
  - **Growth Rate**: Percentage of sold vs active properties
- ✅ **Add Listing Button** - Visible

---

## Features

### Dynamic Stats Cards (Admin Only)
The stats cards on the dashboard are **dynamically calculated** from actual database data:

```javascript
Total Properties: properties.length
Total Revenue: Sum of prices from sold properties (in millions)
Property Views: Sum of all property.views
Growth Rate: (soldProperties / activeProperties) * 100
```

### Tab Filtering Logic

**Buy Tab**: Shows properties with:
- `listingType === 'Sale'`
- `status === 'For Sale'`
- `status === 'Active'`

**Rent Tab**: Shows properties with:
- `listingType === 'Rent'`
- `status === 'For Rent'`

**Sell Tab**: Shows active listings:
- `status === 'Active'`

**Compare Tab**: Shows informational placeholder for upcoming feature

---

## Implementation Files

### Backend
- **User Model**: `backend/src/models/User.js`
  - Added `role` enum: `['Buyer', 'Seller', 'Admin']`
  - Added `permissions` array with specific permission strings
  - Changed `agentDetails` to `sellerDetails`
  - Methods: `isLocked()`, `getDefaultPermissions()`

- **User Controller**: `backend/src/controllers/userController.js`
  - Validates roles: Only `Buyer` or `Seller` allowed for registration
  - Admin users must be created via `createAdmin.js` script
  - Returns `permissions` array in login/register responses

- **Property Controller**: `backend/src/controllers/propertyController.js`
  - Maps `listingType` in API responses for frontend filtering

### Frontend
- **AuthContext**: `frontend/src/contexts/AuthContext.jsx`
  - Added role checking helpers: `hasRole()`, `isAdmin()`, `isAgent()`, `isUser()`
  - Stores `user.role` and `user.permissions`

- **Dashboard**: `frontend/src/pages/Dashboard.jsx`
  - Conditionally renders stats cards (Admin only)
  - Conditionally shows Add Listing button (Seller/Admin)
  - Dynamic stats calculation from property data

- **TopBar**: `frontend/src/components/layouts/TopBar.jsx`
  - Filters tabs based on user role
  - Admin: All tabs
  - Buyer: Buy, Rent, Compare
  - Seller: Sell only

- **Register Page**: `frontend/src/pages/Register.jsx`
  - Options: "Buyer" or "Seller"
  - Default: Buyer

---

## Testing Instructions

### 1. Register as Buyer
```
1. Go to http://localhost:5173/register
2. Fill in details
3. Select "Buy or Rent Properties"
4. Register

Expected Result:
- Dashboard shows: Buy, Rent, Compare tabs
- NO stats cards visible
- NO Add Listing button
```

### 2. Register as Seller
```
1. Go to http://localhost:5173/register
2. Fill in details
3. Select "List Properties (Seller)"
4. Register

Expected Result:
- Dashboard shows: ONLY Sell tab
- NO stats cards visible
- Add Listing button IS visible
```

### 3. Login as Admin
```
First, create admin user:
cd backend
node createAdmin.js

Then login:
Email: admin@realestate.com
Password: Admin@123

Expected Result:
- Dashboard shows: Buy, Sell, Rent, Compare tabs
- Stats cards ARE visible with dynamic data
- Add Listing button IS visible
```

---

## Database Scripts

### Create Admin User
```bash
cd backend
node createAdmin.js
```

### Seed Properties
```bash
# Seed mixed properties (buy/sell)
node seedProperties.js

# Seed additional rental properties
node seedRentals.js
```

### Update Existing Properties
```bash
# Add listingType to existing properties
node updateProperties.js
```

---

## Security Notes

1. **Admin Creation**: Admin users can ONLY be created via the `createAdmin.js` script, not through the registration page

2. **Role Validation**: The backend validates roles during registration - only `Buyer` and `Seller` are allowed

3. **Permission Checks**: Backend routes use middleware to check permissions:
   ```javascript
   protect, // Verify JWT
   authorize('Seller', 'Admin'), // Check role
   checkPermission('create:property') // Check specific permission
   ```

4. **Account Security**: 
   - Account locking after 5 failed login attempts (30-minute lock)
   - Active status check
   - Last login tracking

---

## Future Enhancements

1. **Compare Feature**: Implement actual side-by-side property comparison
2. **Seller Analytics**: Provide sellers with stats for their own listings
3. **Buyer Favorites**: Allow buyers to save and track favorite properties
4. **Real-time Updates**: Stats cards update in real-time as properties are added/sold
5. **Advanced Permissions**: Fine-grained permissions for specific actions

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Buyer/Seller only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Properties
- `GET /api/properties` - Get all properties (supports `listingType` filter)
- `POST /api/properties` - Create property (Seller/Admin only)
- `PUT /api/properties/:id` - Update property (Owner/Admin only)
- `DELETE /api/properties/:id` - Delete property (Owner/Admin only)

---

## Role Switching (For Testing)

If you want to test different roles, you can either:

1. **Register multiple accounts** with different roles
2. **Use MongoDB Compass** to manually change a user's role
3. **Create test users** via the backend console

Example MongoDB update:
```javascript
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "Admin", permissions: [...adminPermissions] } }
)
```

---

## Troubleshooting

### Stats not showing
- Make sure you're logged in as Admin
- Check browser console for errors
- Verify `isAdmin()` function in AuthContext

### Tabs not filtering correctly
- Check if `listingType` field exists in properties
- Run `node updateProperties.js` to add missing fields
- Verify property data in MongoDB

### Add Listing button not visible
- Ensure user role is Seller or Admin
- Check `hasRole(['Seller', 'Admin'])` in Dashboard.jsx
- Verify JWT token includes correct role

---

## Summary

The role-based authentication system provides a secure, scalable foundation for the Real Estate platform with:

- ✅ Three distinct roles with specific permissions
- ✅ Dynamic UI based on user role
- ✅ Secure admin creation process
- ✅ Real-time stats for administrators
- ✅ Role-based tab filtering
- ✅ Permission-based feature access

All components are responsive and update dynamically when properties are added or modified.
