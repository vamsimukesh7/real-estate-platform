# 🚀 Deployment Guide - Real Estate Platform

This guide covers various deployment options for the Real Estate Management Platform.

## 📋 Table of Contents
1. [Frontend Deployment](#frontend-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Production Checklist](#production-checklist)

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Frontend)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend
vercel
```

3. **Configure Build Settings**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

4. **Set Environment Variables in Vercel Dashboard**
```
VITE_API_URL=https://your-backend-api.com
```

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Deploy**
```bash
cd frontend
netlify deploy --prod
```

3. **netlify.toml** (create in frontend root)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Traditional VPS (Nginx)

1. **Build the Frontend**
```bash
cd frontend
npm run build
```

2. **Nginx Configuration** (`/etc/nginx/sites-available/realestate`)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/realestate/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/realestate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Backend Deployment

### Option 1: Render (Recommended for Node.js)

1. **Create `render.yaml`** in backend root:
```yaml
services:
  - type: web
    name: realestate-api
    env: node
    buildCommand: npm install
    startCommand: node src/app.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
```

2. **Connect GitHub Repo** to Render
3. **Configure Environment Variables** in Render Dashboard

### Option 2: Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy**
```bash
cd backend
railway login
railway init
railway up
```

3. **Add Environment Variables**
```bash
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set JWT_SECRET=your_secret
```

### Option 3: VPS with PM2

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create ecosystem.config.js** in backend root:
```javascript
module.exports = {
  apps: [{
    name: 'realestate-api',
    script: './src/app.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
```

3. **Start Application**
```bash
cd backend
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 4: Docker

1. **Create Dockerfile** (backend/Dockerfile):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
```

2. **Build and Run**
```bash
docker build -t realestate-backend .
docker run -p 5000:5000 --env-file .env realestate-backend
```

3. **Docker Compose** (root/docker-compose.yml):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/realestate
    depends_on:
      - mongo
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your backend

3. **Create Database User**
   - Database Access → Add New User
   - Use strong password

4. **Whitelist IP Addresses**
   - Network Access → Add IP Address
   - For development: Allow Access from Anywhere (0.0.0.0/0)
   - For production: Whitelist specific IPs

5. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/realestate?retryWrites=true&w=majority
```

### Local MongoDB (Development)

1. **Install MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from mongodb.com
```

2. **Start MongoDB**
```bash
sudo systemctl start mongodb
# or
mongod
```

---

## Environment Configuration

### Backend (.env)
```env
# Production settings
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=your_production_mongodb_uri

# Security
JWT_SECRET=generate_random_secure_key_here

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# External Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

STRIPE_SECRET_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=your_api_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_SOCKET_URL=https://your-backend-api.com
VITE_GOOGLE_MAPS_API_KEY=your_api_key
```

---

## Production Checklist

### Security
- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Enable CORS only for your frontend domain
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API
- [ ] Implement request validation
- [ ] Use helmet.js for security headers
- [ ] Hash all passwords with bcrypt
- [ ] Sanitize user inputs

### Performance
- [ ] Enable gzip compression
- [ ] Optimize images (use Cloudinary or similar)
- [ ] Implement caching (Redis recommended)
- [ ] Use CDN for static assets
- [ ] Minify CSS/JS in production
- [ ] Enable database indexes
- [ ] Use production builds (NODE_ENV=production)

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Monitor uptime (UptimeRobot, Pingdom)
- [ ] Track analytics (Google Analytics, Mixpanel)
- [ ] Set up APM (New Relic, Datadog)
- [ ] Configure alerts for downtime

### Database
- [ ] Enable authentication
- [ ] Create database backups
- [ ] Set up auto-scaling (if needed)
- [ ] Optimize queries with indexes
- [ ] Use connection pooling

### Testing
- [ ] Test all API endpoints
- [ ] Verify authentication flows
- [ ] Test file uploads
- [ ] Verify payment integration
- [ ] Test on multiple devices
- [ ] Check browser compatibility

---

## SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/...
```

---

## Troubleshooting

### Common Issues

**Frontend can't connect to backend:**
- Check CORS settings in backend
- Verify API URL in frontend .env
- Ensure backend is running and accessible

**Database connection failed:**
- Verify MongoDB URI format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**Socket.IO not working:**
- Check CORS settings for Socket.IO
- Verify WebSocket support on hosting platform
- Test fallback to polling

**Build fails:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are listed in package.json

---

## Support

For deployment issues:
1. Check application logs
2. Review this documentation
3. Open an issue on GitHub

---

**🎉 Congratulations! Your Real Estate Platform is now deployed!**
