// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: 'https://api.arenapro.pk', // Replace with your actual API URL
  ADMIN_BASE_URL: 'https://admin-api.arenapro.pk', // Replace with your actual admin API URL
  
  // Feature flags
  USE_MOCK_DATA: false, // Set to true for development with mock data
  
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Development settings
  LOG_API_CALLS: __DEV__, // Log API calls in development
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    GOOGLE_SIGN_IN: '/auth/google',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_TOKEN: '/auth/verify-token',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    
    // Turfs
    NEARBY_TURFS: '/turfs/nearby',
    TURF_DETAILS: '/turfs/:id',
    SEARCH_TURFS: '/turfs/search',
    TOGGLE_FAVORITE: '/turfs/:id/favorite',
    GET_FAVORITES: '/turfs/favorites',
    
    // Bookings
    AVAILABLE_SLOTS: '/bookings/slots/:turfId',
    CREATE_BOOKING: '/bookings',
    USER_BOOKINGS: '/bookings/user',
    CANCEL_BOOKING: '/bookings/:id',
    
    // Teams & Challenges
    GET_CHALLENGES: '/challenges',
    CREATE_CHALLENGE: '/challenges',
    ACCEPT_CHALLENGE: '/challenges/:id/accept',
    TEAM_STATS: '/teams/:id/stats',
    
    // Payments
    CREATE_PAYMENT: '/payments',
    VERIFY_PAYMENT: '/payments/:id/verify',
    
    // Admin
    ADMIN_LOGIN: '/admin/auth/login',
    ADMIN_DASHBOARD: '/admin/dashboard/stats',
    ADMIN_BOOKINGS: '/admin/bookings',
    ADMIN_VENUES: '/admin/venues',
    ADMIN_CUSTOMERS: '/admin/customers',
    ADMIN_REPORTS: '/admin/reports',
  }
};

// Helper function to build endpoint URLs
export const buildEndpoint = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Helper function to add query parameters
export const addQueryParams = (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${url}?${queryString}` : url;
};