# Admin Panel API Requirements

This document outlines the backend API endpoints required for the PitchIt admin panel to function properly. Both the mobile admin and web admin panels use the same API endpoints.

## Base URL
```
Production: https://api.pitchit.com/api
Development: http://localhost:3001/api
```

## Authentication

### Admin Login
```http
POST /admin/auth/login
Content-Type: application/json

{
  "email": "admin@pitchit.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "email": "admin@pitchit.com",
    "name": "Admin User",
    "role": "super_admin",
    "permissions": ["all"],
    "lastLogin": "2024-02-01T10:00:00Z"
  }
}
```

### Admin Logout
```http
POST /admin/auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token
```http
POST /admin/auth/refresh
Authorization: Bearer {token}

Response:
{
  "success": true,
  "token": "new_jwt_token_here",
  "admin": { ... }
}
```

## Dashboard

### Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalBookings": 1247,
    "todayBookings": 23,
    "totalRevenue": 2450000,
    "activeVenues": 15,
    "totalCustomers": 892,
    "pendingBookings": 7,
    "monthlyGrowth": 12.5,
    "revenueGrowth": 8.3,
    "weeklyStats": [
      {
        "day": "Mon",
        "bookings": 45,
        "revenue": 67500
      },
      // ... more days
    ]
  }
}
```

## Bookings Management

### Get Bookings (with pagination and filters)
```http
GET /admin/bookings?page=0&pageSize=25&filter=all&search=
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 0)
- pageSize: number (default: 25)
- filter: string (all|pending|confirmed|completed|cancelled|today)
- search: string (search in customer name, booking ID, venue name)

Response:
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "BK001",
        "bookingId": "PIT001234",
        "customerName": "Ahmed Ali",
        "customerPhone": "+92 300 1234567",
        "customerEmail": "ahmed.ali@email.com",
        "turfName": "Elite Football Arena",
        "turfArea": "DHA Phase 5, Lahore",
        "sport": "football",
        "dateTime": "2024-02-02T14:44:00Z",
        "duration": 1,
        "slotType": "Prime Time",
        "totalAmount": 2200,
        "status": "confirmed",
        "paymentStatus": "paid",
        "paymentMethod": "card",
        "createdAt": "2024-02-01T10:00:00Z"
      }
      // ... more bookings
    ],
    "total": 1247,
    "page": 0,
    "pageSize": 25
  }
}
```

### Update Booking Status
```http
PUT /admin/bookings/{bookingId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed"
}

Response:
{
  "success": true,
  "message": "Booking status updated successfully"
}
```

### Cancel Booking
```http
PUT /admin/bookings/{bookingId}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Customer request"
}

Response:
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### Get Booking Details
```http
GET /admin/bookings/{bookingId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    // Full booking details with customer and venue info
  }
}
```

## Venues Management

### Get Venues (with pagination and filters)
```http
GET /admin/venues?page=0&pageSize=25&filter=all&search=
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 0)
- pageSize: number (default: 25)
- filter: string (all|active|inactive|football|cricket|padel)
- search: string (search in venue name, area)

Response:
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "V001",
        "name": "Elite Football Arena",
        "area": "DHA Phase 5, Lahore",
        "sports": ["football"],
        "status": "active",
        "totalSlots": 12,
        "bookedSlots": 8,
        "rating": 4.5,
        "totalReviews": 234,
        "priceRange": "1500-2500",
        "facilities": ["Parking", "Changing Room", "Floodlights"],
        "contactPerson": "Manager Ali",
        "contactPhone": "+92 300 1234567",
        "revenue": 125000,
        "createdAt": "2024-01-01T00:00:00Z"
      }
      // ... more venues
    ],
    "total": 50,
    "page": 0,
    "pageSize": 25
  }
}
```

### Create Venue
```http
POST /admin/venues
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Sports Arena",
  "area": "Model Town, Lahore",
  "sports": ["football", "cricket"],
  "totalSlots": 16,
  "priceRange": "1800-2800",
  "facilities": ["Parking", "Cafeteria"],
  "contactPerson": "John Doe",
  "contactPhone": "+92 300 9876543"
}

Response:
{
  "success": true,
  "data": {
    "id": "V051",
    // ... created venue data
  }
}
```

### Update Venue
```http
PUT /admin/venues/{venueId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Arena Name",
  // ... other fields to update
}

Response:
{
  "success": true,
  "data": {
    // ... updated venue data
  }
}
```

### Update Venue Status
```http
PUT /admin/venues/{venueId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "inactive"
}

Response:
{
  "success": true,
  "message": "Venue status updated successfully"
}
```

### Delete Venue
```http
DELETE /admin/venues/{venueId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Venue deleted successfully"
}
```

### Get Venue Analytics
```http
GET /admin/venues/{venueId}/analytics
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalBookings": 156,
    "totalRevenue": 234000,
    "occupancyRate": 75.5,
    "monthlyStats": [
      // ... monthly data
    ]
  }
}
```

## Customers Management

### Get Customers (with pagination and filters)
```http
GET /admin/customers?page=0&pageSize=25&filter=all&search=
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 0)
- pageSize: number (default: 25)
- filter: string (all|active|inactive|vip|new)
- search: string (search in name, email, phone)

Response:
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "C001",
        "name": "Ahmed Ali",
        "email": "ahmed.ali@email.com",
        "phone": "+92 300 1234567",
        "joinDate": "2023-12-15T00:00:00Z",
        "status": "active",
        "totalBookings": 15,
        "totalSpent": 45000,
        "lastBooking": "2024-01-28T00:00:00Z",
        "favoriteVenues": ["Elite Football Arena", "Sports Complex"],
        "preferredSports": ["football"],
        "rating": 4.8,
        "isVip": false
      }
      // ... more customers
    ],
    "total": 892,
    "page": 0,
    "pageSize": 25
  }
}
```

### Get Customer Details
```http
GET /admin/customers/{customerId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    // Full customer details
  }
}
```

### Update Customer Status
```http
PUT /admin/customers/{customerId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "inactive"
}

Response:
{
  "success": true,
  "message": "Customer status updated successfully"
}
```

### Get Customer Bookings
```http
GET /admin/customers/{customerId}/bookings?page=0&pageSize=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "data": [
      // ... customer's bookings
    ],
    "total": 15,
    "page": 0,
    "pageSize": 10
  }
}
```

## Reports & Analytics

### Get Revenue Report
```http
GET /admin/reports/revenue?startDate=2024-01-01&endDate=2024-02-01&groupBy=day
Authorization: Bearer {token}

Query Parameters:
- startDate: string (ISO date)
- endDate: string (ISO date)
- groupBy: string (day|week|month)

Response:
{
  "success": true,
  "data": {
    "totalRevenue": 450000,
    "growth": 12.5,
    "chartData": [
      {
        "date": "2024-01-01",
        "revenue": 15000
      }
      // ... more data points
    ]
  }
}
```

### Get Booking Report
```http
GET /admin/reports/bookings?startDate=2024-01-01&endDate=2024-02-01
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalBookings": 1247,
    "completedBookings": 1156,
    "cancelledBookings": 91,
    "chartData": [
      // ... booking trends
    ]
  }
}
```

## Settings

### Get Settings
```http
GET /admin/settings
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "autoConfirmBookings": true,
    "allowCancellations": true,
    "emailNotifications": true,
    "smsNotifications": true,
    // ... other settings
  }
}
```

### Update Settings
```http
PUT /admin/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "autoConfirmBookings": false,
  "allowCancellations": true,
  // ... settings to update
}

Response:
{
  "success": true,
  "message": "Settings updated successfully"
}
```

## Export Endpoints

### Export Bookings
```http
GET /admin/export/bookings?format=csv&filter=all&startDate=2024-01-01&endDate=2024-02-01
Authorization: Bearer {token}

Response: CSV file download
```

### Export Venues
```http
GET /admin/export/venues?format=csv
Authorization: Bearer {token}

Response: CSV file download
```

### Export Customers
```http
GET /admin/export/customers?format=csv&filter=all
Authorization: Bearer {token}

Response: CSV file download
```

## Notifications

### Send Notification
```http
POST /admin/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "email",
  "recipients": ["customer@email.com"],
  "subject": "Booking Confirmation",
  "message": "Your booking has been confirmed"
}

Response:
{
  "success": true,
  "message": "Notification sent successfully"
}
```

### Get Notifications
```http
GET /admin/notifications?page=0&pageSize=25
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "N001",
        "type": "email",
        "subject": "Booking Confirmation",
        "status": "sent",
        "createdAt": "2024-02-01T10:00:00Z"
      }
      // ... more notifications
    ],
    "total": 50,
    "page": 0,
    "pageSize": 25
  }
}
```

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

## Authentication Headers

All admin endpoints require authentication:
```
Authorization: Bearer {jwt_token}
```

## Rate Limiting

Implement rate limiting for admin endpoints:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated admin

## Data Synchronization

The API should ensure real-time synchronization between:
1. Mobile app user actions → Admin panel updates
2. Admin panel actions → Mobile app updates
3. Web admin panel ↔ Mobile admin panel

Consider implementing WebSocket connections for real-time updates or use polling with reasonable intervals.