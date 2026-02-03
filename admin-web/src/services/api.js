// Alternative API service for admin panel
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Simple API service without class
const api = {
  baseURL: API_BASE_URL,

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          window.location.href = '/';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Dashboard APIs
  getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  },

  // Booking APIs
  getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/bookings?${queryString}`);
  },

  updateBookingStatus(bookingId, status) {
    return this.request(`/admin/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  cancelBooking(bookingId, reason) {
    return this.request(`/admin/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  getBookingDetails(bookingId) {
    return this.request(`/admin/bookings/${bookingId}`);
  },

  // Venue APIs
  getVenues(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/venues?${queryString}`);
  },

  createVenue(venueData) {
    return this.request('/admin/venues', {
      method: 'POST',
      body: JSON.stringify(venueData),
    });
  },

  updateVenue(venueId, venueData) {
    return this.request(`/admin/venues/${venueId}`, {
      method: 'PUT',
      body: JSON.stringify(venueData),
    });
  },

  updateVenueStatus(venueId, status) {
    return this.request(`/admin/venues/${venueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  deleteVenue(venueId) {
    return this.request(`/admin/venues/${venueId}`, {
      method: 'DELETE',
    });
  },

  getVenueAnalytics(venueId) {
    return this.request(`/admin/venues/${venueId}/analytics`);
  },

  // Customer APIs
  getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/customers?${queryString}`);
  },

  getCustomerDetails(customerId) {
    return this.request(`/admin/customers/${customerId}`);
  },

  updateCustomerStatus(customerId, status) {
    return this.request(`/admin/customers/${customerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getCustomerBookings(customerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/customers/${customerId}/bookings?${queryString}`);
  },

  // Reports APIs
  getRevenueReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/revenue?${queryString}`);
  },

  getBookingReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/bookings?${queryString}`);
  },

  getCustomerReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/customers?${queryString}`);
  },

  getVenueReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/venues?${queryString}`);
  },

  // Settings APIs
  getSettings() {
    return this.request('/admin/settings');
  },

  updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Authentication APIs
  login(credentials) {
    return this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout() {
    return this.request('/admin/auth/logout', {
      method: 'POST',
    });
  },

  refreshToken() {
    return this.request('/admin/auth/refresh', {
      method: 'POST',
    });
  },

  // Notification APIs
  sendNotification(notification) {
    return this.request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/notifications?${queryString}`);
  },

  // Export APIs
  async exportBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/admin/export/bookings?${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  },

  async exportVenues(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/admin/export/venues?${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  },

  async exportCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/admin/export/customers?${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  },
};

export default api;
export { api as adminApi };