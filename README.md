# PitchIt - Sports Venue Booking Platform

A comprehensive React Native application for booking sports venues (Cricket, Football, Padel) with an integrated admin panel for venue management.

## 🏏 Features

### For Players
- **Venue Discovery**: Map and list view of nearby sports venues
- **Smart Filtering**: Filter by sport type, facilities, pricing
- **Dynamic Pricing**: Happy Hours, Prime Time, and Regular pricing
- **Team Challenges**: "Lalkaar" system for finding opponents
- **Real-time Booking**: Prevent double-bookings with concurrency handling
- **Multiple Payment Methods**: JazzCash, EasyPaisa, Cards, Cash

### For Admins
- **📱 Mobile Admin Panel**: Native admin interface within the app
- **🌐 Web Admin Panel**: Comprehensive web-based management system
- **📊 Real-time Dashboard**: Statistics, revenue tracking, and analytics
- **📅 Booking Management**: View, confirm, cancel, and track all bookings
- **🏟️ Venue Management**: Add, edit, activate/deactivate venues
- **👥 Customer Management**: User profiles, booking history, and status management
- **📈 Reports & Analytics**: Revenue reports, booking trends, and performance metrics

### Core Features
- **OTP Authentication**: Secure phone number-based login
- **🔄 Real-time Synchronization**: Instant data sync between admin panel and mobile app
- **🔔 Live Notifications**: Real-time updates when venues are added or modified
- **WebSocket Integration**: Live updates and notifications
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Multi-language Support**: English and Urdu localization

## 🛠 Technology Stack

### Mobile App
- **Frontend**: React Native with Expo
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper (Material Design)
- **Maps**: React Native Maps (Google Maps)
- **Navigation**: React Navigation v6

### Web Admin Panel
- **Frontend**: React 18
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Charts**: Recharts
- **Data Grid**: MUI X Data Grid

### Backend Integration
- **API**: RESTful APIs with JWT authentication
- **Real-time**: WebSocket for live updates
- **Database**: Unified data source for consistency

## 🔄 Real-Time Synchronization

### Firebase Integration
- **Instant Updates**: Venues added in admin panel appear immediately in mobile app
- **Live Notifications**: Mobile users get notified when new venues are added
- **Automatic Sync**: No manual refresh needed - everything updates in real-time
- **Offline Support**: Firebase handles connection issues gracefully

### How It Works
1. **Admin adds venue** → Firebase Firestore updated
2. **Mobile app listens** → Real-time listener detects change
3. **Redux store updated** → UI refreshes automatically
4. **Notification shown** → User sees "New venue added!" message

📖 **[Complete Real-Time Sync Guide](REALTIME_SYNC_GUIDE.md)**

## 📱 Installation

### Mobile App Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/pitchit.git
   cd pitchit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update API endpoints in `src/config/devConfig.js`
   - Add Google Maps API key
   - Configure payment gateway credentials

4. **Run the mobile application**
   ```bash
   # For development
   npm start

   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

### Web Admin Panel Setup

**⚠️ IMPORTANT: Always run from the `admin-web` directory!**

#### Option 1: Quick Start (Recommended)
```bash
# Windows users - Double-click this file:
admin-web/CLICK_TO_START.bat

# Mac/Linux users:
chmod +x admin-web/start-here.sh
./admin-web/start-here.sh
```

#### Option 2: Manual Setup
```bash
# 1. Navigate to admin-web directory (IMPORTANT!)
cd admin-web

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

#### Option 3: Complete Reset (If having issues)
```bash
cd admin-web
rm -rf node_modules package-lock.json
npm install
npm start
```

**Access the admin panel:**
- Open [http://localhost:3000](http://localhost:3000)
- Login with: `admin@pitchit.com` / `admin123`

### Quick Setup Script

Run the automated setup:
```bash
node setup-admin.js
```

## 🏗 Project Structure

```
pitchit/
├── src/                    # Mobile app source
│   ├── components/         # Reusable UI components
│   ├── screens/           # Screen components
│   │   ├── admin/         # Mobile admin screens
│   │   ├── auth/          # Authentication screens
│   │   ├── main/          # Home, Map screens
│   │   ├── booking/       # Booking flow
│   │   └── profile/       # User profile
│   ├── store/             # Redux store
│   ├── services/          # API services
│   └── navigation/        # Navigation configuration
├── admin-web/             # Web admin panel
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Admin pages
│   │   ├── services/      # API services
│   │   └── store/         # Redux store
│   └── public/
├── docs/                  # Documentation
│   ├── ADMIN_API_REQUIREMENTS.md
│   └── ADMIN_SYNC_SETUP.md
└── setup-admin.js         # Setup script
```

## 🔄 Admin Panel Synchronization

The mobile and web admin panels are fully synchronized:

- **Unified API**: Both platforms use the same backend endpoints
- **Real-time Updates**: WebSocket integration for live data sync
- **Consistent State**: Redux stores maintain data consistency
- **Automatic Refresh**: Periodic sync ensures data accuracy

### Data Synchronization Features
- ✅ **Bookings**: Real-time booking updates across platforms
- ✅ **Venues**: Venue status and information sync
- ✅ **Customers**: User data and status management
- ✅ **Dashboard**: Live statistics and analytics
- ✅ **Reports**: Synchronized reporting data

## 📊 Admin Panel Features

### 🎯 Dashboard
- Real-time statistics and KPIs
- Interactive charts and graphs
- Recent activity feed
- Quick action buttons

### 📅 Booking Management
- Advanced filtering and search
- Bulk operations
- Status management
- Customer contact integration
- Export functionality

### 🏟️ Venue Management
- CRUD operations for venues
- Occupancy rate tracking
- Revenue analytics
- Status management
- Contact information

### 👥 Customer Management
- Customer profiles and history
- Tier system (Bronze, Silver, Gold, VIP)
- Status management
- Booking analytics

### 📈 Reports & Analytics
- Revenue trend analysis
- Booking statistics
- Customer growth metrics
- Performance dashboards
- Export capabilities

## 🔧 Configuration

### Environment Variables

**Mobile App (`src/config/devConfig.js`)**
```javascript
export const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:3001/api',
  ADMIN_API_BASE_URL: 'http://localhost:3001/api',
  ENABLE_ADMIN_PANEL: true,
  ADMIN_AUTO_REFRESH_INTERVAL: 30000,
};
```

**Web Admin (`.env`)**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/ws
```

### API Integration

Implement the backend API according to `ADMIN_API_REQUIREMENTS.md`:
- Authentication endpoints
- CRUD operations for all entities
- Real-time WebSocket support
- Export functionality

## 🚀 Deployment

### Mobile App
```bash
# Android
expo build:android

# iOS
expo build:ios
```

### Web Admin Panel
```bash
cd admin-web
npm run build
# Deploy build folder to static hosting
```

## 🔍 Monitoring & Debugging

### Sync Status Monitoring
```javascript
import { syncService } from './src/services/syncService';
console.log(syncService.getSyncStatus());
```

### WebSocket Connection Health
```javascript
import { wsService } from './src/services/websocketService';
console.log(wsService.getStatus());
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Built for Sports Communities

PitchIt brings together players, venue owners, and administrators in one comprehensive platform, making sports venue booking seamless and efficient.

---

**Contact**: support@pitchit.com
**Documentation**: See `/docs` folder for detailed guides