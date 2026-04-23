# Backend Setup Guide

This guide will help you set up and run the Arena Pro backend API to connect with your admin panel and mobile app.

## 🚀 Quick Start

### 1. **Install MongoDB**

**Option A: MongoDB Community Server (Recommended)**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at: https://www.mongodb.com/atlas
- Create cluster and get connection string
- Update `MONGODB_URI` in `backend/.env`

**Option C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

### 3. **Start the Backend Server**
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

### 4. **Seed Sample Data**
```bash
npm run seed
```

## 📊 **What You'll Get After Seeding:**

### Sample Data Created:
- **3 Users** (Ahmed Ali, Sara Khan, Hassan Ahmed)
- **2 Admins** (admin, manager)
- **4 Turfs** (Football, Cricket, Padel, Futsal venues)
- **15 Bookings** (Random bookings across different dates and statuses)

### Admin Login Credentials:
- **Username**: `admin` | **Password**: `admin123`
- **Username**: `manager` | **Password**: `manager123`

## 🔧 **Backend Server Details:**

- **Port**: 3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api
- **Admin Dashboard API**: http://localhost:3001/api/admin/dashboard/stats

## 📱 **Connect Admin Panel:**

Once the backend is running, your admin panel will automatically connect and show real data instead of empty states!

### Expected Results:
- ✅ Dashboard shows real booking counts and revenue
- ✅ Bookings page shows sample bookings
- ✅ Venues page shows 4 sample venues
- ✅ Customers page shows 3 sample users
- ✅ No more "ERR_CONNECTION_REFUSED" errors

## 🛠️ **Troubleshooting:**

### MongoDB Connection Issues:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Or check with netstat
netstat -an | grep 27017
```

### Port Already in Use:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Dependencies Issues:
```bash
# Clear npm cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 🔄 **Development Workflow:**

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Admin Panel**: `cd admin-web && npm start`
3. **Start Mobile App**: `npx react-native start`

## 📚 **API Endpoints Available:**

### Authentication:
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/admin/auth/login` - Admin login

### Admin Dashboard:
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/bookings` - Bookings management
- `GET /api/admin/venues` - Venues management
- `GET /api/admin/customers` - Customers management

### Mobile App:
- `GET /api/turfs/nearby` - Get nearby venues
- `GET /api/turfs/:id` - Get venue details
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - User bookings

## ✅ **Success Indicators:**

When everything is working correctly:

1. **Backend Console Shows**:
   ```
   🚀 Arena Pro API Server running on port 3001
   📍 Environment: development
   🔗 Health check: http://localhost:3001/health
   📚 API Base URL: http://localhost:3001/api
   ```

2. **Admin Panel Shows**:
   - Real booking numbers instead of zeros
   - Sample venues and customers
   - No connection errors in console

3. **Mobile App Shows**:
   - Sample venues on home screen
   - Venue details when tapped
   - Booking functionality works

## 🎯 **Next Steps:**

1. **Add Your Own Data**: Use the admin panel to add venues and manage bookings
2. **Add More Venues**: Use the admin panel or API
3. **Configure Email**: Add SMTP settings to `.env`
4. **Deploy**: Use services like Heroku, Railway, or DigitalOcean

Your Arena Pro backend is now ready for development and testing!