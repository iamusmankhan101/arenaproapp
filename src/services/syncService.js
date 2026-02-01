import { DEV_CONFIG } from '../config/devConfig';
import { store } from '../store/store';
import { fetchDashboardStats, fetchBookings, fetchVenues, fetchCustomers } from '../store/slices/adminSlice';

class SyncService {
  constructor() {
    this.syncInterval = null;
    this.isActive = false;
    this.lastSync = null;
  }

  // Start automatic synchronization
  startSync() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('Starting admin data synchronization...');
    
    // Initial sync
    this.performSync();
    
    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, DEV_CONFIG.ADMIN_AUTO_REFRESH_INTERVAL);
  }

  // Stop automatic synchronization
  stopSync() {
    if (!this.isActive) return;
    
    this.isActive = false;
    console.log('Stopping admin data synchronization...');
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Perform a full data sync
  async performSync() {
    if (!this.isActive) return;
    
    try {
      console.log('Syncing admin data...');
      const dispatch = store.dispatch;
      
      // Sync dashboard stats
      await dispatch(fetchDashboardStats());
      
      // Get current state to determine what needs syncing
      const state = store.getState().admin;
      
      // Sync bookings if they're being viewed
      if (state.bookings.length > 0 || state.bookingsLoading) {
        await dispatch(fetchBookings({ filter: 'all', search: '' }));
      }
      
      // Sync venues if they're being viewed
      if (state.venues.length > 0 || state.venuesLoading) {
        await dispatch(fetchVenues({ filter: 'all', search: '' }));
      }
      
      // Sync customers if they're being viewed
      if (state.customers.length > 0 || state.customersLoading) {
        await dispatch(fetchCustomers({ filter: 'all', search: '' }));
      }
      
      this.lastSync = new Date();
      console.log('Admin data sync completed at:', this.lastSync);
      
    } catch (error) {
      console.error('Admin data sync failed:', error);
    }
  }

  // Force sync specific data type
  async syncBookings(filters = {}) {
    try {
      const dispatch = store.dispatch;
      await dispatch(fetchBookings(filters));
    } catch (error) {
      console.error('Bookings sync failed:', error);
    }
  }

  async syncVenues(filters = {}) {
    try {
      const dispatch = store.dispatch;
      await dispatch(fetchVenues(filters));
    } catch (error) {
      console.error('Venues sync failed:', error);
    }
  }

  async syncCustomers(filters = {}) {
    try {
      const dispatch = store.dispatch;
      await dispatch(fetchCustomers(filters));
    } catch (error) {
      console.error('Customers sync failed:', error);
    }
  }

  async syncDashboard() {
    try {
      const dispatch = store.dispatch;
      await dispatch(fetchDashboardStats());
    } catch (error) {
      console.error('Dashboard sync failed:', error);
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isActive: this.isActive,
      lastSync: this.lastSync,
      interval: DEV_CONFIG.ADMIN_AUTO_REFRESH_INTERVAL
    };
  }

  // Manual sync trigger
  async manualSync() {
    console.log('Manual sync triggered');
    await this.performSync();
  }
}

// Create singleton instance
export const syncService = new SyncService();

// Auto-start sync when admin is authenticated
export const initializeAdminSync = () => {
  const state = store.getState();
  if (state.auth?.isAuthenticated) {
    syncService.startSync();
  }
};

// Stop sync when admin logs out
export const stopAdminSync = () => {
  syncService.stopSync();
};

export default syncService;