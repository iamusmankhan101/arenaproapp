# Admin Panel Synchronization Setup

This document explains how the mobile app and web admin panel are synchronized to ensure consistent data across both platforms.

## Overview

The admin panel synchronization system ensures that:
1. **Mobile Admin Panel** and **Web Admin Panel** show the same data
2. Changes made in one platform are reflected in the other
3. Real-time updates are pushed to both platforms
4. Data remains consistent even with multiple admin users

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │  Web Admin      │
│   Admin Panel   │◄──►│   + WebSocket   │◄──►│  Panel          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Database             │
                    │   (Single Source of       │
                    │        Truth)             │
                    └───────────────────────────┘
```

## Synchronization Methods

### 1. API-Based Synchronization
Both platforms use the same REST API endpoints:

**Mobile App:**
- Uses `src/services/adminApi.js`
- Redux store: `src/store/slices/adminSlice.js`

**Web Admin:**
- Uses `admin-web/src/services/adminApi.js`
- Redux store: `admin-web/src/store/slices/adminSlice.js`

### 2. Real-Time Updates (WebSocket)
- WebSocket service: `src/services/websocketService.js`
- Provides instant updates for:
  - New bookings
  - Status changes
  - Dashboard statistics
  - System notifications

### 3. Periodic Sync
- Sync service: `src/services/syncService.js`
- Automatically refreshes data every 30 seconds
- Ensures data consistency even if WebSocket fails

## Data Flow

### 1. User Actions → API → Database
```
User Action (Mobile/Web) → API Request → Database Update → Response
```

### 2. Real-Time Notifications
```
Database Change → WebSocket Server → Connected Clients → UI Update
```

### 3. Periodic Refresh
```
Timer → API Request → Latest Data → Redux Store → UI Update
```

## Implementation Details

### Mobile App Integration

**1. API Service (`src/services/adminApi.js`)**
```javascript
import { DEV_CONFIG } from '../config/devConfig';

class AdminApiService {
  constructor() {
    this.baseURL = DEV_CONFIG.ADMIN_API_BASE_URL;
  }
  
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }
  
  async getBookings(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/bookings?${queryString}`);
  }
  // ... more methods
}
```

**2. Redux Integration**
```javascript
// src/store/slices/adminSlice.js
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getDashboardStats();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

**3. Component Usage**
```javascript
// src/screens/admin/AdminDashboardScreen.js
const dispatch = useDispatch();
const { dashboardStats, loading } = useSelector(state => state.admin);

useEffect(() => {
  dispatch(fetchDashboardStats());
}, [dispatch]);
```

### Web Admin Integration

**1. API Service (`admin-web/src/services/adminApi.js`)**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AdminApiService {
  // Same structure as mobile app
}
```

**2. Redux Integration**
```javascript
// admin-web/src/store/slices/adminSlice.js
// Same async thunks as mobile app
```

**3. Component Usage**
```javascript
// admin-web/src/pages/DashboardPage.js
const dispatch = useDispatch();
const { dashboardStats, loading } = useSelector(state => state.admin);

useEffect(() => {
  dispatch(fetchDashboardStats());
}, [dispatch]);
```

## Configuration

### Environment Variables

**Mobile App (`src/config/devConfig.js`)**
```javascript
export const DEV_CONFIG = {
  API_BASE_URL: __DEV__ ? 'http://localhost:3001/api' : 'https://api.pitchit.com/api',
  ADMIN_API_BASE_URL: __DEV__ ? 'http://localhost:3001/api' : 'https://api.pitchit.com/api',
  ADMIN_AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  ENABLE_WEBSOCKET: true,
};
```

**Web Admin (`.env`)**
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/ws
```

## Data Consistency Features

### 1. Optimistic Updates
- UI updates immediately on user action
- Reverts if API call fails
- Provides smooth user experience

### 2. Error Handling
- Automatic retry for failed requests
- Fallback to cached data
- User-friendly error messages

### 3. Conflict Resolution
- Last-write-wins for simple updates
- Version-based conflict detection
- Manual resolution for complex conflicts

## Real-Time Features

### WebSocket Events

**Booking Events:**
- `new_booking` - New booking created
- `booking_updated` - Booking status changed
- `booking_cancelled` - Booking cancelled

**Venue Events:**
- `venue_updated` - Venue information changed
- `venue_status_changed` - Venue activated/deactivated

**Customer Events:**
- `customer_updated` - Customer information changed
- `customer_status_changed` - Customer blocked/unblocked

**System Events:**
- `stats_updated` - Dashboard statistics changed
- `notification` - System notification

### WebSocket Message Format
```json
{
  "type": "booking_updated",
  "data": {
    "bookingId": "BK001",
    "status": "confirmed",
    "timestamp": "2024-02-01T10:00:00Z"
  }
}
```

## Monitoring & Debugging

### 1. Sync Status
```javascript
import { syncService } from '../services/syncService';

const status = syncService.getSyncStatus();
console.log('Sync Status:', status);
// Output: { isActive: true, lastSync: Date, interval: 30000 }
```

### 2. WebSocket Status
```javascript
import { wsService } from '../services/websocketService';

const status = wsService.getStatus();
console.log('WebSocket Status:', status);
// Output: { isConnected: true, reconnectAttempts: 0, queuedMessages: 0 }
```

### 3. API Logging
```javascript
// Enable in development
const DEV_CONFIG = {
  LOG_API_CALLS: __DEV__ && true,
};
```

## Performance Optimization

### 1. Caching Strategy
- Cache frequently accessed data
- Invalidate cache on updates
- Background refresh for stale data

### 2. Pagination
- Server-side pagination for large datasets
- Lazy loading for better performance
- Virtual scrolling for long lists

### 3. Debouncing
- Debounce search queries
- Throttle API calls
- Batch multiple updates

## Security Considerations

### 1. Authentication
- JWT tokens for API access
- Token refresh mechanism
- Automatic logout on token expiry

### 2. Authorization
- Role-based access control
- Permission-based feature access
- Audit logging for admin actions

### 3. Data Validation
- Input validation on both client and server
- SQL injection prevention
- XSS protection

## Deployment Considerations

### 1. Environment Setup
- Separate API endpoints for dev/staging/production
- Environment-specific WebSocket URLs
- Feature flags for gradual rollout

### 2. Monitoring
- API response time monitoring
- WebSocket connection health
- Error rate tracking

### 3. Scaling
- Load balancing for API servers
- WebSocket server clustering
- Database connection pooling

## Troubleshooting

### Common Issues

**1. Data Not Syncing**
- Check API endpoint configuration
- Verify authentication tokens
- Check network connectivity

**2. WebSocket Connection Failed**
- Verify WebSocket URL
- Check firewall settings
- Fallback to polling mode

**3. Stale Data**
- Force refresh data
- Clear application cache
- Check sync service status

### Debug Commands

```javascript
// Force sync all data
import { syncService } from '../services/syncService';
syncService.manualSync();

// Reconnect WebSocket
import { wsService } from '../services/websocketService';
wsService.disconnect();
wsService.connect(token);

// Clear Redux store
import { store } from '../store/store';
store.dispatch({ type: 'admin/clearAll' });
```

## Future Enhancements

1. **Offline Support**
   - Cache data for offline access
   - Queue actions for when online
   - Conflict resolution on reconnect

2. **Advanced Real-Time Features**
   - Live cursor tracking
   - Collaborative editing
   - Real-time notifications

3. **Performance Improvements**
   - GraphQL for efficient data fetching
   - Server-sent events as WebSocket alternative
   - Edge caching for static data

4. **Enhanced Monitoring**
   - Real-time performance metrics
   - User activity tracking
   - Automated error reporting