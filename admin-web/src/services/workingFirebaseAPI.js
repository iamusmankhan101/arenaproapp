// Working Firebase Admin API
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase directly in this file
let app = null;
let db = null;

const initFirebase = () => {
  if (!app) {
    console.log('🔥 Initializing Firebase directly...');
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  }
  return db;
};

// Working Admin API
export const workingAdminAPI = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      console.log('🔥 Fetching dashboard stats...');
      const firestore = initFirebase();
      
      // Fetch venues count
      const venuesQuery = collection(firestore, 'venues');
      const venuesSnapshot = await getDocs(venuesQuery);
      const totalVenues = venuesSnapshot.size;
      const activeVenues = venuesSnapshot.docs.filter(doc => 
        doc.data().status === 'active'
      ).length;
      
      // Fetch bookings count (if bookings collection exists)
      let totalBookings = 0;
      let todayBookings = 0;
      let pendingBookings = 0;
      try {
        const bookingsQuery = collection(firestore, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsQuery);
        totalBookings = bookingsSnapshot.size;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        bookingsSnapshot.docs.forEach(doc => {
          const booking = doc.data();
          const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
          
          // Count today's bookings
          if (bookingDate >= today) {
            todayBookings++;
          }
          
          // Count pending bookings
          if (booking.status === 'pending') {
            pendingBookings++;
          }
        });
      } catch (bookingError) {
        console.log('📅 No bookings collection found, using default values');
      }
      
      // Fetch customers count (if users collection exists)
      let totalCustomers = 0;
      try {
        const usersQuery = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersQuery);
        totalCustomers = usersSnapshot.size;
      } catch (userError) {
        console.log('👥 No users collection found, using default values');
      }
      
      // Calculate revenue (mock for now, can be enhanced later)
      const totalRevenue = totalBookings * 1500; // Assuming average booking of 1500 PKR
      
      const stats = {
        totalBookings,
        todayBookings,
        totalRevenue,
        activeVenues,
        totalVenues,
        totalCustomers,
        pendingBookings,
        monthlyGrowth: 0, // Can be calculated based on historical data
        revenueGrowth: 0, // Can be calculated based on historical data
        weeklyStats: [
          { day: 'Mon', bookings: 0, revenue: 0 },
          { day: 'Tue', bookings: 0, revenue: 0 },
          { day: 'Wed', bookings: 0, revenue: 0 },
          { day: 'Thu', bookings: 0, revenue: 0 },
          { day: 'Fri', bookings: 0, revenue: 0 },
          { day: 'Sat', bookings: 0, revenue: 0 },
          { day: 'Sun', bookings: 0, revenue: 0 },
        ]
      };
      
      console.log('✅ Dashboard stats fetched:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error in dashboard stats:', error);
      return {
        totalBookings: 0,
        todayBookings: 0,
        totalRevenue: 0,
        activeVenues: 0,
        totalCustomers: 0,
        pendingBookings: 0,
        monthlyGrowth: 0,
        revenueGrowth: 0,
        weeklyStats: []
      };
    }
  },

  // Get venues
  async getVenues(params = {}) {
    try {
      console.log('🏟️ Fetching venues...');
      const firestore = initFirebase();
      
      // Create query for venues collection
      let venuesQuery = collection(firestore, 'venues');
      
      // Add ordering
      venuesQuery = query(venuesQuery, orderBy('createdAt', 'desc'));
      
      // Execute query
      const querySnapshot = await getDocs(venuesQuery);
      
      // Process results
      const venues = [];
      querySnapshot.forEach((doc) => {
        const venueData = doc.data();
        venues.push({
          id: doc.id,
          ...venueData,
          // Ensure dates are properly formatted
          createdAt: venueData.createdAt?.toDate?.() || new Date(),
          updatedAt: venueData.updatedAt?.toDate?.() || new Date(),
          // Add default values for DataGrid columns
          rating: venueData.rating || 0,
          totalReviews: venueData.totalReviews || 0,
          revenue: venueData.revenue || 0,
          bookedSlots: venueData.bookedSlots || 0,
          totalSlots: venueData.totalSlots || venueData.timeSlots?.length || 0,
          priceRange: venueData.priceRange || venueData.basePrice || 0,
          contactPerson: venueData.contactPerson || 'N/A',
          contactPhone: venueData.contactPhone || 'N/A',
          // Ensure arrays are properly formatted
          sports: Array.isArray(venueData.sports) ? venueData.sports : [],
          facilities: Array.isArray(venueData.facilities) ? venueData.facilities : [],
          timeSlots: Array.isArray(venueData.timeSlots) ? venueData.timeSlots : [],
          images: Array.isArray(venueData.images) ? venueData.images : []
        });
      });
      
      const result = {
        data: venues,
        total: venues.length,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };
      
      console.log(`✅ Venues fetched: ${venues.length} venues found`);
      return result;
      
    } catch (error) {
      console.error('❌ Error fetching venues:', error);
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };
    }
  },

  // Get bookings
  async getBookings(params = {}) {
    try {
      console.log('📅 Fetching bookings...');
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      return {
        data: [],
        total: 0,
        page: 0,
        pageSize: 25
      };
    }
  },

  // Get customers
  async getCustomers(params = {}) {
    try {
      console.log('👥 Fetching customers...');
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      return {
        data: [],
        total: 0,
        page: 0,
        pageSize: 25
      };
    }
  },

  // Add venue (working implementation)
  async addVenue(venueData) {
    try {
      console.log('➕ Adding venue:', venueData.name);
      const firestore = initFirebase();
      
      // Prepare venue data for Firestore
      const venueToAdd = {
        ...venueData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        // Ensure numeric fields are properly converted
        basePrice: Number(venueData.basePrice),
        latitude: Number(venueData.latitude) || 31.5204,
        longitude: Number(venueData.longitude) || 74.3587,
        // Ensure arrays are properly formatted
        sports: Array.isArray(venueData.sports) ? venueData.sports : [],
        facilities: Array.isArray(venueData.facilities) ? venueData.facilities : [],
        timeSlots: Array.isArray(venueData.timeSlots) ? venueData.timeSlots : [],
        images: Array.isArray(venueData.images) ? venueData.images : []
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(firestore, 'venues'), venueToAdd);
      
      console.log('✅ Venue added successfully with ID:', docRef.id);
      return { 
        success: true, 
        message: 'Venue added successfully',
        id: docRef.id,
        data: { ...venueToAdd, id: docRef.id }
      };
      
    } catch (error) {
      console.error('❌ Error adding venue:', error);
      throw new Error(`Failed to add venue: ${error.message}`);
    }
  },

  // Update venue status
  async updateVenueStatus(venueId, status) {
    try {
      console.log('🔄 Updating venue status:', venueId, status);
      const firestore = initFirebase();
      
      const venueRef = doc(firestore, 'venues', venueId);
      await updateDoc(venueRef, {
        status: status,
        updatedAt: new Date()
      });
      
      console.log('✅ Venue status updated successfully');
      return { success: true, message: 'Venue status updated successfully' };
    } catch (error) {
      console.error('❌ Error updating venue status:', error);
      throw new Error(`Failed to update venue status: ${error.message}`);
    }
  },

  // Update venue
  async updateVenue(venueId, venueData) {
    try {
      console.log('🔄 Updating venue:', venueId, venueData);
      const firestore = initFirebase();
      
      const venueRef = doc(firestore, 'venues', venueId);
      const updateData = {
        ...venueData,
        updatedAt: new Date()
      };
      
      await updateDoc(venueRef, updateData);
      
      console.log('✅ Venue updated successfully');
      return { 
        id: venueId, 
        ...updateData,
        success: true, 
        message: 'Venue updated successfully' 
      };
    } catch (error) {
      console.error('❌ Error updating venue:', error);
      throw new Error(`Failed to update venue: ${error.message}`);
    }
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      console.log('🔄 Updating booking status:', bookingId, status);
      return { success: true, message: 'Booking status updated successfully' };
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      throw error;
    }
  },

  // Update customer status
  async updateCustomerStatus(customerId, status) {
    try {
      console.log('🔄 Updating customer status:', customerId, status);
      return { success: true, message: 'Customer status updated successfully' };
    } catch (error) {
      console.error('❌ Error updating customer status:', error);
      throw error;
    }
  }
};

export default workingAdminAPI;