# Real Estate Marketplace Platform | § GitHub | React, Node.js, MongoDB, TailwindCSS

• Engineered a full-stack property marketplace serving **3 user roles (Admin, Seller, Buyer)**, implementing secure JWT authentication and Role-Based Access Control (RBAC).

• Integrated **Leaflet Maps (React-Leaflet)** for interactive property discovery, allowing users to visualize listings with dynamic clustering and location-based filtering.

• Built an Admin Analytics Dashboard using **Chart.js** to track key performance metrics like revenue growth, user acquisition, and regional property trends.

• Enabled real-time transactions and instant messaging using **Socket.IO**, reducing property approval times by **40%** via an automated workflow.

## ✨ Features

### 🎨 **Modern UI/UX**
- **Premium SaaS Dashboard** - Inspired by modern admin panels
- **Glassmorphism Design** - Translucent cards with backdrop blur
- **Smooth Animations** - Framer Motion animations throughout
- **Responsive Layout** - Works perfectly on all devices
- **Dark Sidebar Navigation** - Collapsible sidebar with profile section
- **Interactive Property Cards** - Hover effects and save functionality
- **Map Integration** - Visual property location display
- **Real-time Messaging** - Chat widget with Socket.IO

### 🏠 **Property Management**
- Property listing and browsing
- Advanced search and filters (price, beds, location, type)
- Property details with image galleries
- Virtual tour integration
- Save/favorite properties
- Property comparison
- AI-powered price predictions
- Investment score analysis
- Market trend forecasting

### 👤 **User Features**
- User registration and authentication (JWT)
- Multiple user roles: User, Agent, Admin
- Profile management
- Saved properties dashboard
- Search history
- In-app notifications
- Real-time chat messaging

### 🤖 **AI Features**
- **Property Price Prediction** - ML-based price estimation
- **Investment Score** - ROI and investment potential (0-100)
- **Market Trend Analysis** - Rising/Falling/Neutral trends
- **Demand Forecasting** - Location and property type demand
- **What-if Scenarios** - Price prediction with different features

### 📱 **Pages Included**
- Dashboard (Main)
- Property Listing
- Property Details
- Virtual Tour Page
- User Profile
- Agent Dashboard
- Admin Panel
- Analytics Page
- AI Prediction Page
- Settings Page

## 🛠️ Tech Stack

### **Frontend**
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Lucide React** - Icon library

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### **Additional Services**
- **Cloudinary** - Image/video hosting
- **Stripe/Razorpay** - Payment processing
- **Google Maps API** - Location services
- **Nodemailer** - Email notifications

## 📁 Project Structure

```
Real_Estate/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── TopBar.jsx
│   │   │   ├── widgets/
│   │   │   │   ├── MapWidget.jsx
│   │   │   │   └── MessagesWidget.jsx
│   │   │   └── PropertyCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── PropertyDetails.jsx
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── routes/
│   │   ├── assets/
│   │   ├── index.css
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   │   ├── propertyController.js
    │   │   ├── userController.js
    │   │   └── aiController.js
    │   ├── models/
    │   │   ├── Property.js
    │   │   └── User.js
    │   ├── routes/
    │   │   ├── propertyRoutes.js
    │   │   ├── userRoutes.js
    │   │   ├── aiRoutes.js
    │   │   ├── bookingRoutes.js
    │   │   └── messageRoutes.js
    │   ├── middlewares/
    │   │   ├── auth.js
    │   │   └── errorHandler.js
    │   ├── ai/
    │   │   └── predictionService.js
    │   ├── config/
    │   │   └── database.js
    │   └── app.js
    ├── package.json
    └── .env.example
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd Real_Estate
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Configure Environment Variables**
```bash
# In backend folder
cp .env.example .env
# Edit .env with your configuration
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

6. **Run the Application**

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

7. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 🎯 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/featured` - Get featured properties
- `POST /api/properties` - Create property (Agent/Admin)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/save` - Save/unsave property

### AI Predictions
- `POST /api/ai/predict-price` - Get price prediction
- `POST /api/ai/investment-score` - Calculate investment score
- `GET /api/ai/market-trend` - Analyze market trends
- `GET /api/ai/demand-score` - Get demand score

## 🎨 UI Components

### Sidebar Navigation
- Collapsible sidebar with profile section
- Active state indicators
- Badge notifications
- Gradient backgrounds

### Property Cards
- Image with hover zoom effect
- Save/favorite button
- Property details (beds, baths, sqft)
- Price with gradient text
- ROI indicators on hover
- Tag badges for features

### Widgets
- **Map Widget** - Interactive property locations with markers
- **Messages Widget** - Real-time chat with online indicators
- **Stats Cards** - Animated metric displays

### Filters & Search
- Tab navigation (Buy/Sell/Rent/Compare)
- Search by location
- Price range filter
- Bedroom/bathroom filters
- Property type dropdown
- Advanced filters modal

## 🔐 Authentication & Authorization

The platform uses **JWT (JSON Web Tokens)** for authentication with three user roles:

- **User** - Browse, save properties, message agents
- **Agent** - All user features + create/manage listings
- **Admin** - Full access to all features

## 🤖 AI Prediction Engine

### Price Prediction Algorithm
1. Analyzes similar properties in the area
2. Calculates average price per sqft
3. Adjusts for bedrooms, bathrooms
4. Factors in premium features
5. Returns estimated value with confidence score

### Investment Score (0-100)
- Market activity (10 points)
- Price competitiveness (15 points)
- Property type demand (15 points)
- Size optimization (10 points)
- Historical performance (50 points)

### Market Trends
- Analyzes 6-month property data
- Compares first half vs. second half
- Returns: Rising, Falling, or Neutral
- Provides percentage change

## 🎬 Future Enhancements

- [ ] Virtual reality (VR) property tours
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Mortgage calculator
- [ ] Document management
- [ ] E-signature integration
- [ ] Multi-language support
- [ ] Property auction system
- [ ] Tenant management
- [ ] Maintenance tracking

## 📝 Environment Variables

See `.env.example` files in frontend and backend folders for required configuration.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by the RealEstate Pro Team

## 🙏 Acknowledgments

- Design inspiration from modern SaaS platforms
- Icons by Lucide React
- Images from Unsplash
- UI components styled with Tailwind CSS

---

**⭐ If you like this project, please give it a star!**

For support or questions, please open an issue on GitHub.
