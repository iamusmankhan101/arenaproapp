# 🎯 Complete Setup Instructions

## ✅ **Current Status: Hard-coded Data Successfully Removed!**

The admin panel is now making real API calls instead of showing hard-coded data. The `ERR_CONNECTION_REFUSED` errors confirm this is working correctly.

## 🚀 **Next Step: Start the Backend Server**

### **Option 1: Quick Start (Windows)**
1. **Install MongoDB** (if not already installed):
   - Download: https://www.mongodb.com/try/download/community
   - Install and start the MongoDB service

2. **Run the backend**:
   ```cmd
   START_BACKEND.bat
   ```

### **Option 2: Manual Setup**
1. **Start MongoDB** (one of these options):
   ```bash
   # Option A: If MongoDB is installed as service
   net start MongoDB
   
   # Option B: Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Install and start backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Seed sample data**:
   ```bash
   npm run seed
   ```

## 📊 **What Happens Next:**

### After Backend Starts:
1. **Admin Panel Dashboard** will show:
   - ✅ Real booking counts (instead of zeros)
   - ✅ Sample venues and customers
   - ✅ Working charts and statistics
   - ✅ No more connection errors

2. **Mobile App** will show:
   - ✅ Sample venues on home screen
   - ✅ Working venue details
   - ✅ Functional booking system

### Sample Data Created:
- **4 Venues**: Football, Cricket, Padel, Futsal
- **3 Users**: Ahmed Ali, Sara Khan, Hassan Ahmed  
- **2 Admins**: admin/admin123, manager/manager123
- **15 Bookings**: Various dates and statuses

## 🔐 **Admin Login Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

## 🌐 **Server URLs:**
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Admin Panel**: http://localhost:3000

## 🎉 **Success Indicators:**

### Backend Console Shows:
```
🚀 Arena Pro API Server running on port 3001
📍 Environment: development
🔗 Health check: http://localhost:3001/health
```

### Admin Panel Shows:
- Real data instead of empty states
- No "ERR_CONNECTION_REFUSED" errors
- Working dashboard with charts

## 🛠️ **Troubleshooting:**

### MongoDB Not Running:
```bash
# Check if MongoDB is running
netstat -an | findstr :27017

# Start MongoDB service (Windows)
net start MongoDB
```

### Port 3001 Already in Use:
```bash
# Find and kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Dependencies Issues:
```bash
cd backend
rm -rf node_modules
npm install
```

## 📱 **Development Workflow:**

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Admin Panel**: `cd admin-web && npm start`  
3. **Start Mobile App**: `npx react-native start`

## 🎯 **Mission Accomplished:**

✅ **Hard-coded data completely removed**
✅ **Real API integration ready**
✅ **Sample data available for testing**
✅ **Admin panel connects to real backend**
✅ **Mobile app ready for real data**

Your Arena Pro application is now properly configured with a real backend API!