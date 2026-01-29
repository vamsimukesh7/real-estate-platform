# ⚡ Quick Start Guide

Get the Real Estate Platform running in 5 minutes!

## 🎯 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local)
- **Git** ([Download](https://git-scm.com/))

## 🚀 Installation Steps

### 1️⃣ Clone or Navigate to Project
```bash
cd Real_Estate
```

### 2️⃣ Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Mac/Linux

# Edit .env file with your settings (minimal required):
# MONGODB_URI=mongodb://localhost:27017/realestate
# JWT_SECRET=your-secret-key-min-32-chars
```

### 3️⃣ Setup Frontend

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies (if not already done)
npm install
```

### 4️⃣ Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

## 🎨 What You'll See

![Dashboard Preview](https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80)

The dashboard includes:
- ✅ Dark collapsible sidebar with navigation
- ✅ Top bar with tabs and search/filters
- ✅ Property cards grid with hover effects
- ✅ Map widget showing property locations
- ✅ Messages widget with chat interface
- ✅ Stats cards with animations

## 🧪 Test the Features

### 1. Browse Properties
- Open http://localhost:5173
- View the property grid
- Click on property cards
- Use the save (heart) button

### 2. Test Filters
- Click "Buy", "Sell", "Rent" tabs
- Use the search bar
- Try price/bed filters
- Toggle "Map View"

### 3. View Property Details
- Click any property card
- Browse the image gallery
- View specifications
- Check AI predictions (if enabled)

### 4. Test API
```bash
# Get all properties
curl http://localhost:5000/api/properties

# Get health status
curl http://localhost:5000/api/health
```

## 🔧 Quick Customization

### Change Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR',  // Main brand color
    600: '#YOUR_DARKER_COLOR',
  }
}
```

### Add Sample Properties
You can use the API or MongoDB directly:

**Option 1: Use Postman/Insomnia**
1. Register a user: `POST /api/users/register`
2. Get the token from response
3. Create property: `POST /api/properties` (with token)

**Option 2: MongoDB Directly**
```javascript
// Connect to MongoDB and insert
use realestate
db.properties.insertOne({
  name: "Sample Property",
  price: 500000,
  location: {
    address: "123 Main St",
    city: "Miami",
    state: "FL",
    country: "USA"
  },
  propertyType: "House",
  listingType: "Sale",
  specifications: {
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2000
  },
  status: "Active",
  featured: true
})
```

## 📱 Mobile View

Resize your browser to see the responsive design in action!

## 🐛 Common Issues

### Port Already in Use
```bash
# Change port in backend/.env
PORT=5001

# Or frontend/vite.config.js
server: { port: 3000 }
```

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod  # If using local MongoDB
```

### Module Not Found Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Read the Docs:**
   - [README.md](README.md) - Full documentation
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production

2. **Customize:**
   - Add more property features
   - Customize the design
   - Add more pages

3. **Deploy:**
   - Frontend to Vercel/Netlify
   - Backend to Render/Railway
   - Database to MongoDB Atlas

## 💡 Tips

- **Hot Reload:** Both servers auto-reload on file changes
- **DevTools:** Open browser DevTools (F12) to inspect
- **API Testing:** Use Postman or Thunder Client (VS Code)
- **Debugging:** Check console logs in terminal and browser

## 🎉 You're Ready!

The platform is now running locally. Start building amazing features!

---

**Need Help?** Check the [README.md](README.md) or open an issue.
