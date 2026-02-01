import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockAuthAPI } from './mockAuth';

const BASE_URL = 'https://api.arenapro.pk'; // Replace with your actual API URL
const USE_MOCK_API = process.env.NODE_ENV === 'development' && false; // Disable mock API by default

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiry - clear stored auth data
      await AsyncStorage.multiRemove(['authToken', 'user']);
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Create a wrapper that uses mock API in development
const createAuthMethod = (mockMethod, realMethod) => {
  return USE_MOCK_API ? mockMethod : realMethod;
};

export const authAPI = {
  // Traditional phone/password authentication
  signIn: createAuthMethod(
    mockAuthAPI.signIn,
    (phoneNumber, password) => api.post('/auth/signin', { phoneNumber, password })
  ),
  
  signUp: createAuthMethod(
    mockAuthAPI.signUp,
    (phoneNumber, password, fullName) => api.post('/auth/signup', { phoneNumber, password, fullName })
  ),
  
  // Google authentication
  googleSignIn: createAuthMethod(
    mockAuthAPI.googleSignIn,
    (googleToken) => api.post('/auth/google', { token: googleToken })
  ),
  
  // OTP-based authentication (fallback)
  sendOTP: createAuthMethod(
    mockAuthAPI.sendOTP,
    (phoneNumber) => api.post('/auth/send-otp', { phoneNumber })
  ),
  
  verifyOTP: createAuthMethod(
    mockAuthAPI.verifyOTP,
    (phoneNumber, otp, password, fullName, isSignup) => 
      api.post('/auth/verify-otp', { phoneNumber, otp, password, fullName, isSignup })
  ),
  
  // Token verification
  verifyToken: createAuthMethod(
    mockAuthAPI.verifyToken,
    (token) => api.get('/auth/verify-token', {
      headers: { Authorization: `Bearer ${token}` }
    })
  ),
  
  // Password reset
  forgotPassword: createAuthMethod(
    mockAuthAPI.forgotPassword,
    (phoneNumber) => api.post('/auth/forgot-password', { phoneNumber })
  ),
  
  resetPassword: createAuthMethod(
    mockAuthAPI.resetPassword,
    (phoneNumber, otp, newPassword) => 
      api.post('/auth/reset-password', { phoneNumber, otp, newPassword })
  ),
  
  // Profile management
  updateProfile: (userData) => 
    api.put('/auth/profile', userData),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

export const turfAPI = {
  getNearbyTurfs: (lat, lng, radius) => 
    api.get(`/turfs/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getTurfDetails: (turfId) => api.get(`/turfs/${turfId}`),
  searchTurfs: (query, filters) => api.post('/turfs/search', { query, filters }),
  
  // Favorites functionality
  toggleFavorite: (turfId) => api.post(`/turfs/${turfId}/favorite`),
  getFavorites: () => api.get('/turfs/favorites'),
};

export const bookingAPI = {
  getAvailableSlots: (turfId, date) => api.get(`/bookings/slots/${turfId}?date=${date}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings/user'),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
};

export const teamAPI = {
  getChallenges: () => api.get('/challenges'),
  createChallenge: (challengeData) => api.post('/challenges', challengeData),
  acceptChallenge: (challengeId) => api.post(`/challenges/${challengeId}/accept`),
  getTeamStats: (teamId) => api.get(`/teams/${teamId}/stats`),
};

export const paymentAPI = {
  createPayment: (paymentData) => api.post('/payments', paymentData),
  verifyPayment: (paymentId) => api.get(`/payments/${paymentId}/verify`),
};

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Bookings
  getBookings: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/bookings?${queryString}`);
  },
  updateBookingStatus: (bookingId, status) => 
    api.put(`/admin/bookings/${bookingId}/status`, { status }),
  cancelBooking: (bookingId, reason) => 
    api.put(`/admin/bookings/${bookingId}/cancel`, { reason }),
  getBookingDetails: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
  
  // Venues
  getVenues: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/venues?${queryString}`);
  },
  createVenue: (venueData) => api.post('/admin/venues', venueData),
  updateVenue: (venueId, venueData) => 
    api.put(`/admin/venues/${venueId}`, venueData),
  updateVenueStatus: (venueId, status) => 
    api.put(`/admin/venues/${venueId}/status`, { status }),
  deleteVenue: (venueId) => api.delete(`/admin/venues/${venueId}`),
  getVenueAnalytics: (venueId) => api.get(`/admin/venues/${venueId}/analytics`),
  
  // Customers
  getCustomers: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/customers?${queryString}`);
  },
  getCustomerDetails: (customerId) => api.get(`/admin/customers/${customerId}`),
  updateCustomerStatus: (customerId, status) => 
    api.put(`/admin/customers/${customerId}/status`, { status }),
  getCustomerBookings: (customerId, params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/customers/${customerId}/bookings?${queryString}`);
  },
  
  // Reports
  getRevenueReport: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/revenue?${queryString}`);
  },
  getBookingReport: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/bookings?${queryString}`);
  },
  getCustomerReport: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/customers?${queryString}`);
  },
  getVenueReport: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/venues?${queryString}`);
  },
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings),
  
  // Authentication
  login: (credentials) => api.post('/admin/auth/login', credentials),
  logout: () => api.post('/admin/auth/logout'),
  refreshToken: () => api.post('/admin/auth/refresh'),
  
  // Notifications
  sendNotification: (notification) => api.post('/admin/notifications', notification),
  getNotifications: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/notifications?${queryString}`);
  },
};

export default api;