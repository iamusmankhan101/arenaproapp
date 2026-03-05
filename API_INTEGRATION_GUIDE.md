# API Integration Guide

This guide explains how to integrate the Arena Pro app with your backend API and remove all hard-coded data.

## Overview

The app has been updated to use real API calls instead of hard-coded mock data. All mock data has been removed from:

- Home screen venue listings
- Challenge data
- Admin panel dashboard, bookings, venues, and customers
- Booking and turf management

## Configuration

### 1. Mobile App Configuration

Update the API configuration in `src/config/apiConfig.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com', // Replace with your API URL
  USE_MOCK_DATA: false, // Set to true only for development
  // ... other settings
};
```

### 2. Admin Panel Configuration

Create a `.env` file in the `admin-web` directory:

```bash
REACT_APP_API_URL=https://your-admin-api-domain.com/api
REACT_APP_USE_MOCK=false
```

## Required API Endpoints

### Authentication Endpoints

```
POST /auth/signin
POST /auth/signup  
POST /auth/google
POST /auth/send-otp
POST /auth/verify-otp
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/verify-token
PUT  /auth/profile
PUT  /auth/change-password
```

### Turf/Venue Endpoints

```
GET  /turfs/nearby?lat={lat}&lng={lng}&radius={radius}
GET  /turfs/{id}
POST /turfs/search
POST /turfs/{id}/favorite
GET  /turfs/favorites
```

### Booking Endpoints

```
GET    /bookings/slots/{turfId}?date={date}
POST   /bookings
GET    /bookings/user
DELETE /bookings/{id}
```

### Team & Challenge Endpoints

```
GET  /challenges
POST /challenges
POST /challenges/{id}/accept
GET  /teams/{id}/stats
```

### Admin Endpoints

```
# Dashboard
GET /admin/dashboard/stats

# Bookings Management
GET /admin/bookings?page={page}&pageSize={size}&filter={filter}&search={query}
PUT /admin/bookings/{id}/status
PUT /admin/bookings/{id}/cancel

# Venues Management  
GET /admin/venues?page={page}&pageSize={size}&filter={filter}&search={query}
POST /admin/venues
PUT /admin/venues/{id}
PUT /admin/venues/{id}/status
DELETE /admin/venues/{id}

# Customer Management
GET /admin/customers?page={page}&pageSize={size}&filter={filter}&search={query}
PUT /admin/customers/{id}/status
GET /admin/customers/{id}

# Reports
GET /admin/reports/revenue?startDate={date}&endDate={date}
GET /admin/reports/bookings?startDate={date}&endDate={date}
```

## Expected Data Formats

### Venue/Turf Object
```json
{
  "id": "string|number",
  "name": "string",
  "area": "string", 
  "city": "string",
  "sport": "string", // "Football", "Cricket", "Padel", "Futsal"
  "rating": "number",
  "reviewCount": "number",
  "pricePerHour": "number",
  "image": "string", // URL or local path
  "time": "string", // Operating hours
  "bookable": "boolean",
  "distance": "number",
  "surfaceType": "string",
  "hasFloodlights": "boolean",
  "hasGenerator": "boolean", 
  "hasParking": "boolean"
}
```

### Challenge Object
```json
{
  "id": "string|number",
  "title": "string",
  "teamName": "string",
  "sport": "string",
  "type": "string", // "open", "private", "tournament"
  "proposedDateTime": "string", // ISO date
  "venue": "string",
  "maxGroundFee": "string",
  "status": "string",
  "teamWins": "number",
  "teamLosses": "number", 
  "teamElo": "number",
  "fairPlayScore": "number",
  "timeAgo": "string",
  "isWinnerTakesAll": "boolean"
}
```

### Booking Object
```json
{
  "id": "string",
  "bookingId": "string", // Display ID like "PIT001234"
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "turfName": "string",
  "turfArea": "string", 
  "sport": "string",
  "dateTime": "string", // ISO date
  "duration": "number", // Hours
  "totalAmount": "number",
  "status": "string", // "confirmed", "pending", "cancelled", "completed"
  "paymentStatus": "string", // "paid", "pending", "refunded"
  "createdAt": "string" // ISO date
}
```

### Admin Dashboard Stats
```json
{
  "totalBookings": "number",
  "todayBookings": "number", 
  "totalRevenue": "number",
  "activeVenues": "number",
  "totalCustomers": "number",
  "pendingBookings": "number",
  "monthlyGrowth": "number", // Percentage
  "revenueGrowth": "number", // Percentage
  "weeklyStats": [
    {
      "day": "string", // "Mon", "Tue", etc.
      "bookings": "number",
      "revenue": "number"
    }
  ]
}
```

## Authentication

All API requests (except auth endpoints) should include the Authorization header:

```
Authorization: Bearer {token}
```

The app stores the token in:
- Mobile: AsyncStorage with key 'authToken'  
- Admin: localStorage with key 'adminToken'

## Error Handling

The app expects standard HTTP status codes:
- 200: Success
- 401: Unauthorized (triggers logout)
- 400: Bad Request
- 404: Not Found
- 500: Server Error

Error responses should include:
```json
{
  "error": "string",
  "message": "string"
}
```

## Testing the Integration

1. **Enable Real API**: Set `USE_MOCK_DATA = false` in configuration files
2. **Start Backend**: Ensure your API server is running
3. **Test Endpoints**: Use the app to verify each feature works:
   - Home screen loads venues from API
   - Challenges load from API
   - Admin panel shows real data
   - Bookings work end-to-end
   - Authentication flows work

## Fallback Behavior

If API calls fail, the app will:
- Show loading states appropriately
- Display "No data available" messages
- Log errors to console (in development)
- Continue functioning without crashing

## Development vs Production

- **Development**: Can enable mock data for testing UI
- **Production**: Always uses real API calls

Set environment variables accordingly:
- `REACT_APP_USE_MOCK=true` (development only)
- `REACT_APP_USE_MOCK=false` (production)

## Next Steps

1. Replace API URLs in configuration files with your actual endpoints
2. Implement the required backend endpoints
3. Test each feature thoroughly
4. Deploy with production API URLs

The app is now ready for real API integration with all hard-coded data removed.