# 📚 API Documentation

Complete API reference for the Real Estate Management Platform.

**Base URL:** `http://localhost:5000/api` (Development)  
**Production:** `https://your-api-domain.com/api`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 👤 User Routes

### Register User
```http
POST /api/users/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "User" // Optional: "User", "Agent", "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

---

### Login User
```http
POST /api/users/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "avatar": { "url": "..." }
  }
}
```

---

### Get Current User
```http
GET /api/users/me
```
🔒 **Protected**

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "savedProperties": [...],
    "notifications": [...]
  }
}
```

---

### Update Profile
```http
PUT /api/users/profile
```
🔒 **Protected**

**Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "bio": "Real estate enthusiast"
}
```

---

### Get Saved Properties
```http
GET /api/users/saved-properties
```
🔒 **Protected**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Modern Villa",
      "price": 1250000,
      "location": {...}
    }
  ]
}
```

---

## 🏠 Property Routes

### Get All Properties
```http
GET /api/properties
```

**Query Parameters:**
- `city` - Filter by city
- `state` - Filter by state
- `propertyType` - House, Apartment, Condo, Villa, Townhouse, Land
- `listingType` - Sale, Rent, Lease
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `bedrooms` - Minimum bedrooms
- `bathrooms` - Minimum bathrooms
- `minSqft` - Minimum square feet
- `maxSqft` - Maximum square feet
- `status` - Active, Pending, Sold, Rented, Inactive
- `featured` - true/false
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 12)
- `sort` - Sort field (e.g., "-createdAt", "price")

**Example:**
```http
GET /api/properties?city=Miami&propertyType=Villa&minPrice=500000&maxPrice=2000000&bedrooms=3&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 47,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Modern Villa with Ocean View",
      "description": "Beautiful property...",
      "price": 1250000,
      "location": {
        "address": "1234 Ocean Drive",
        "city": "Miami",
        "state": "Florida",
        "zipCode": "33139",
        "country": "USA",
        "coordinates": { "lat": 25.7617, "lng": -80.1918 }
      },
      "propertyType": "Villa",
      "listingType": "Sale",
      "specifications": {
        "bedrooms": 4,
        "bathrooms": 3,
        "sqft": 3500,
        "lotSize": 8500,
        "yearBuilt": 2021,
        "floors": 2,
        "parking": 2
      },
      "features": ["Pool", "Garden", "Smart Home"],
      "amenities": ["WiFi", "Security", "Gym"],
      "images": [...],
      "status": "Active",
      "featured": true,
      "owner": {...},
      "agent": {...},
      "views": 1250,
      "saves": [...],
      "aiPredictions": {...},
      "createdAt": "2024-01-15T08:30:00.000Z",
      "updatedAt": "2024-01-15T08:30:00.000Z"
    }
  ]
}
```

---

### Get Single Property
```http
GET /api/properties/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Modern Villa with Ocean View",
    // ... full property details
  }
}
```

---

### Get Featured Properties
```http
GET /api/properties/featured
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [...]
}
```

---

### Create Property
```http
POST /api/properties
```
🔒 **Protected** (Agent/Admin only)

**Body:**
```json
{
  "name": "Luxury Penthouse",
  "description": "Stunning penthouse with panoramic city views...",
  "price": 2500000,
  "location": {
    "address": "567 High Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  },
  "propertyType": "Apartment",
  "listingType": "Sale",
  "specifications": {
    "bedrooms": 3,
    "bathrooms": 2.5,
    "sqft": 2800,
    "yearBuilt": 2022,
    "floors": 1,
    "parking": 2
  },
  "features": ["City View", "Balcony", "Smart Home"],
  "amenities": ["Gym", "Pool", "Concierge"],
  "images": [
    {
      "url": "https://...",
      "publicId": "...",
      "caption": "Living Room"
    }
  ],
  "featured": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Luxury Penthouse",
    // ... created property
  }
}
```

---

### Update Property
```http
PUT /api/properties/:id
```
🔒 **Protected** (Owner/Admin only)

**Body:** Same as Create (partial updates allowed)

---

### Delete Property
```http
DELETE /api/properties/:id
```
🔒 **Protected** (Owner/Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### Save/Unsave Property
```http
POST /api/properties/:id/save
```
🔒 **Protected**

**Response:**
```json
{
  "success": true,
  "saved": true,
  "message": "Property saved"
}
```

---

## 🤖 AI Prediction Routes

### Get Price Prediction
```http
POST /api/ai/predict-price
```

**Body:**
```json
{
  "location": {
    "city": "Miami",
    "state": "Florida"
  },
  "propertyType": "Villa",
  "specifications": {
    "bedrooms": 4,
    "bathrooms": 3,
    "sqft": 3500
  },
  "features": ["Pool", "Ocean View"],
  "amenities": ["WiFi", "Security"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimatedValue": 1350000,
    "priceRange": {
      "min": 1147500,
      "max": 1552500
    },
    "confidence": 85.5,
    "dataPoints": 42
  }
}
```

---

### Get Investment Score
```http
POST /api/ai/investment-score
```

**Body:** Same as price prediction

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 78
  }
}
```

---

### Get Market Trend
```http
GET /api/ai/market-trend?city=Miami&state=Florida
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trend": "Rising",
    "changePercent": "8.45",
    "averagePriceFirstHalf": 1200000,
    "averagePriceSecondHalf": 1301400
  }
}
```

---

### Get Demand Score
```http
GET /api/ai/demand-score?city=Miami&state=Florida&propertyType=Villa
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 82
  }
}
```

---

### Update Property AI Predictions
```http
POST /api/ai/update-property/:id
```
🔒 **Protected** (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "AI predictions updated",
  "data": {
    "estimatedValue": 1350000,
    "priceRange": { "min": 1147500, "max": 1552500 },
    "investmentScore": 78,
    "marketTrend": "Rising",
    "demandScore": 82,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 📊 Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 10,
  "total": 47,
  "totalPages": 5,
  "currentPage": 1,
  "data": [...]
}
```

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔄 WebSocket Events (Socket.IO)

### Client → Server

**Join Room:**
```javascript
socket.emit('join-room', roomId);
```

**Send Message:**
```javascript
socket.emit('send-message', {
  roomId: 'room123',
  message: 'Hello!',
  sender: 'userId',
  timestamp: new Date()
});
```

### Server → Client

**Receive Message:**
```javascript
socket.on('receive-message', (data) => {
  console.log(data);
});
```

---

## 📝 Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Properties:**
```bash
curl -X GET "http://localhost:5000/api/properties?city=Miami&bedrooms=3"
```

**Create Property (with auth):**
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Beach House",
    "price": 950000,
    ...
  }'
```

---

## 🧪 Testing with Postman

1. Import the API collection
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token
3. Use `{{base_url}}` and `{{token}}` in requests

---

For more information, see the main [README.md](README.md)
