import { DEV_CONFIG } from '../config/devConfig';

class AdminApiService {
  constructor() {
    this.baseURL = DEV_CONFIG.ADMIN_API_BASE_URL;
  }

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
    const token = localStorage.getItem('adminToken') || global.adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  // Booking APIs
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/bookings?${queryString}`);
  }

  async updateBookingStatus(bookingId, status) {
    return this.request(`/admin/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelBooking(bookingId, reason) {
    return this.request(`/admin/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getBookingDetails(bookingId) {
    return this.request(`/admin/bookings/${bookingId}`);
  }

  // Venue APIs
  async getVenues(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/venues?${queryString}`);
  }

  async createVenue(venueData) {
    return this.request('/admin/venues', {
      method: 'POST',
      body: JSON.stringify(venueData),
    });
  }

  async updateVenue(venueId, venueData) {
    return this.request(`/admin/venues/${venueId}`, {
      method: 'PUT',
      body: JSON.stringify(venueData),
    });
  }

  async updateVenueStatus(venueId, status) {
    return this.request(`/admin/venues/${venueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteVenue(venueId) {
    return this.request(`/admin/venues/${venueId}`, {
      method: 'DELETE',
    });
  }

  async getVenueAnalytics(venueId) {
    return this.request(`/admin/venues/${venueId}/analytics`);
  }

  // Customer APIs
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/customers?${queryString}`);
  }

  async getCustomerDetails(customerId) {
    return this.request(`/admin/customers/${customerId}`);
  }

  async updateCustomerStatus(customerId, status) {
    return this.request(`/admin/customers/${customerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getCustomerBookings(customerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/customers/${customerId}/bookings?${queryString}`);
  }

  // Reports APIs
  async getRevenueReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/revenue?${queryString}`);
  }

  async getBookingReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/bookings?${queryString}`);
  }

  async getCustomerReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/customers?${queryString}`);
  }

  async getVenueReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/reports/venues?${queryString}`);
  }

  // Settings APIs
  async getSettings() {
    return this.request('/admin/settings');
  }

  async updateSettings(settings) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Authentication APIs
  async login(credentials) {
    return this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/admin/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/admin/auth/refresh', {
      method: 'POST',
    });
  }

  // Notification APIs
  async sendNotification(notification) {
    return this.request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/notifications?${queryString}`);
  }
}

export const adminApi = new AdminApiService();
export default adminApi;