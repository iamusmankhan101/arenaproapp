# PitchIt Admin Web Panel

A comprehensive web-based admin panel for managing the PitchIt turf booking platform. Built with React, Material-UI, and Redux Toolkit.

## Features

### 🎯 Dashboard
- Real-time statistics and KPIs
- Interactive charts and graphs
- Recent activity feed
- Quick action buttons
- Revenue and booking trends

### 📅 Booking Management
- View all bookings with advanced filtering
- Search by customer, booking ID, or venue
- Confirm/cancel bookings
- Contact customer information
- Export booking data
- Pagination and server-side filtering

### 🏟️ Venue Management
- Comprehensive venue listing
- Occupancy rate tracking
- Revenue analytics per venue
- Activate/deactivate venues
- Filter by sport type or status
- Contact information management

### 👥 Customer Management
- Customer database with profiles
- Customer tier system (Bronze, Silver, Gold, VIP)
- Booking history and spending analytics
- Block/unblock customers
- Filter by status, tier, or registration date
- Contact management

### 📊 Reports & Analytics
- Revenue trend analysis
- Sports distribution charts
- Customer growth metrics
- Top performing venues
- Monthly/weekly statistics
- Export functionality

### ⚙️ Settings
- General platform settings
- Notification preferences
- Security configurations
- Payment settings
- System management tools

## Technology Stack

- **Frontend**: React 18
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Charts**: Recharts
- **Data Grid**: MUI X Data Grid
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the admin-web directory:
```bash
cd admin-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials
- **Email**: admin@pitchit.com
- **Password**: admin123

## Project Structure

```
admin-web/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout.js          # Main layout with sidebar
│   ├── pages/
│   │   ├── LoginPage.js       # Admin authentication
│   │   ├── DashboardPage.js   # Main dashboard
│   │   ├── BookingsPage.js    # Booking management
│   │   ├── VenuesPage.js      # Venue management
│   │   ├── CustomersPage.js   # Customer management
│   │   ├── ReportsPage.js     # Analytics & reports
│   │   └── SettingsPage.js    # System settings
│   ├── store/
│   │   ├── store.js           # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.js   # Authentication state
│   │       └── adminSlice.js  # Admin data state
│   ├── App.js                 # Main app component
│   ├── index.js              # App entry point
│   └── index.css             # Global styles
├── package.json
└── README.md
```

## Key Features

### 🔐 Authentication
- Secure admin login
- Session management
- Auto-logout on inactivity
- Remember login state

### 📱 Responsive Design
- Mobile-friendly interface
- Collapsible sidebar on mobile
- Responsive data grids
- Touch-friendly interactions

### 🔍 Advanced Filtering
- Real-time search
- Multiple filter options
- Server-side pagination
- Export capabilities

### 📈 Data Visualization
- Interactive charts
- Real-time updates
- Multiple chart types
- Responsive design

### 🎨 Modern UI
- Material Design principles
- Consistent theming
- Smooth animations
- Intuitive navigation

## API Integration

The admin panel uses mock data for demonstration. To integrate with a real backend:

1. Update the API endpoints in `src/store/slices/adminSlice.js`
2. Replace mock data with actual API calls
3. Configure authentication endpoints
4. Set up proper error handling

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build folder can be deployed to any static hosting service like:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables
Create a `.env` file for environment-specific configurations:
```
REACT_APP_API_URL=https://api.pitchit.com
REACT_APP_VERSION=1.0.0
```

## Performance Optimizations

- Code splitting with React.lazy()
- Memoized components
- Virtualized data grids for large datasets
- Optimized bundle size
- Lazy loading of charts

## Security Features

- JWT token authentication
- Protected routes
- Input validation
- XSS protection
- CSRF protection

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.