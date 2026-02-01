import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  GeoPoint,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Helper function to serialize Firestore data and handle timestamps
const serializeFirestoreData = (data) => {
  if (!data) return data;
  
  const serialized = { ...data };
  
  // Handle timestamp fields
  if (data.createdAt?.toDate) {
    serialized.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt?.toDate) {
    serialized.updatedAt = data.updatedAt.toDate().toISOString();
  }
  
  // Handle nested objects that might contain timestamps
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a timestamp
      if (value.toDate && typeof value.toDate === 'function') {
        serialized[key] = value.toDate().toISOString();
      } else {
        // Recursively serialize nested objects
        serialized[key] = serializeFirestoreData(value);
      }
    }
  });
  
  return serialized;
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Turf/Venue API
export const turfAPI = {
  // Get nearby turfs - now returns all active venues without location filtering
  async getNearbyTurfs(latitude, longitude, radius = 10) {
    try {
      console.log('🏟️ Mobile app: Fetching all active venues (no location filtering)...');
      const turfsRef = collection(db, 'venues');
      const q = query(turfsRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      console.log(`📊 Mobile app: Found ${snapshot.size} total active venues in database`);
      
      const turfs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        console.log(`📍 Mobile app: Adding venue ${data.name} to results`);
        
        const serializedData = serializeFirestoreData({
          id: doc.id,
          ...data,
          distance: 0, // Set distance to 0 since we're not filtering by location
          // Add compatibility fields for existing components
          sport: Array.isArray(data.sports) ? data.sports[0] : (typeof data.sports === 'string' ? data.sports.split(',')[0].trim() : 'Unknown'),
          pricePerHour: data.pricing?.basePrice || 0,
          time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
        });
        
        turfs.push(serializedData);
      });
      
      // Sort by name instead of distance
      turfs.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`✅ Mobile app: Returning ${turfs.length} venues (all active venues)`);
      return { data: turfs };
    } catch (error) {
      console.error('❌ Mobile app: Error fetching venues:', error);
      throw error;
    }
  },

  // Get turf details
  async getTurfDetails(turfId) {
    try {
      const turfRef = doc(db, 'venues', turfId);
      const turfSnap = await getDoc(turfRef);
      
      if (!turfSnap.exists()) {
        throw new Error('Turf not found');
      }
      
      const data = turfSnap.data();
      const serializedData = serializeFirestoreData({
        id: turfSnap.id,
        ...data
      });
      
      return { data: serializedData };
    } catch (error) {
      console.error('Error fetching turf details:', error);
      throw error;
    }
  },

  // Toggle favorite
  async toggleFavorite(turfId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, 
        where('userId', '==', user.uid), 
        where('turfId', '==', turfId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Add to favorites
        await addDoc(favoritesRef, {
          userId: user.uid,
          turfId: turfId,
          createdAt: serverTimestamp()
        });
        return { data: { isFavorite: true } };
      } else {
        // Remove from favorites
        const favoriteDoc = snapshot.docs[0];
        await deleteDoc(doc(db, 'favorites', favoriteDoc.id));
        return { data: { isFavorite: false } };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Get user favorites
  async getFavorites() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const favoriteIds = snapshot.docs.map(doc => doc.data().turfId);
      
      if (favoriteIds.length === 0) {
        return { data: [] };
      }
      
      // Get turf details for favorites
      const turfsRef = collection(db, 'venues');
      const favorites = [];
      
      for (const turfId of favoriteIds) {
        const turfDoc = await getDoc(doc(turfsRef, turfId));
        if (turfDoc.exists()) {
          favorites.push({
            id: turfDoc.id,
            ...turfDoc.data()
          });
        }
      }
      
      return { data: favorites };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }
};

// Booking API
export const bookingAPI = {
  // Get available slots
  async getAvailableSlots(turfId, date) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const q = query(bookingsRef, 
        where('turfId', '==', turfId),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        where('status', 'in', ['confirmed', 'pending'])
      );
      
      const snapshot = await getDocs(q);
      const bookedSlots = snapshot.docs.map(doc => doc.data().timeSlot);
      
      // Generate available slots (6 AM to 11 PM)
      const slots = [];
      for (let hour = 6; hour <= 22; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        // Calculate price based on time (peak hours cost more)
        let basePrice = 2000;
        if (hour >= 17 && hour <= 21) basePrice = 2500; // Peak hours
        if (hour >= 6 && hour <= 8) basePrice = 1800; // Morning discount
        
        slots.push({
          id: hour,
          time: timeSlot,
          endTime: endTime,
          price: basePrice,
          available: !bookedSlots.includes(timeSlot)
        });
      }
      
      return { data: slots };
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  },

  // Create booking
  async createBooking(bookingData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        userId: user.uid,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingReference: `PIT${Date.now().toString().slice(-6)}`,
        createdAt: serverTimestamp()
      });
      
      return { 
        data: { 
          id: bookingRef.id, 
          ...bookingData,
          status: 'confirmed',
          bookingReference: `PIT${Date.now().toString().slice(-6)}`
        } 
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get user bookings
  async getUserBookings() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { data: bookings };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        paymentStatus: 'refunded',
        cancelledAt: serverTimestamp()
      });
      
      return { data: { success: true, message: 'Booking cancelled successfully' } };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};

// Team/Challenge API
export const teamAPI = {
  // Get challenges
  async getChallenges() {
    try {
      const challengesRef = collection(db, 'challenges');
      const q = query(challengesRef, 
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const challenges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { data: challenges };
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Create challenge
  async createChallenge(challengeData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const challengeRef = await addDoc(collection(db, 'challenges'), {
        ...challengeData,
        createdBy: user.uid,
        status: 'open',
        createdAt: serverTimestamp()
      });
      
      return { data: { id: challengeRef.id, ...challengeData } };
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Accept challenge
  async acceptChallenge(challengeId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        acceptedBy: user.uid,
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });
      
      const updatedChallenge = await getDoc(challengeRef);
      return { data: { id: updatedChallenge.id, ...updatedChallenge.data() } };
    } catch (error) {
      console.error('Error accepting challenge:', error);
      throw error;
    }
  }
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      const bookingsRef = collection(db, 'bookings');
      const turfsRef = collection(db, 'turfs');
      const usersRef = collection(db, 'users');
      
      // Get all bookings
      const bookingsSnapshot = await getDocs(bookingsRef);
      const bookings = bookingsSnapshot.docs.map(doc => doc.data());
      
      // Get today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBookings = bookings.filter(booking => {
        const bookingDate = booking.createdAt?.toDate() || new Date();
        return bookingDate >= today;
      });
      
      // Calculate revenue
      const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      // Get active turfs count
      const turfsSnapshot = await getDocs(query(turfsRef, where('isActive', '==', true)));
      
      // Get total users count
      const usersSnapshot = await getDocs(usersRef);
      
      // Get pending bookings
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      
      return {
        data: {
          totalBookings: bookings.length,
          todayBookings: todayBookings.length,
          totalRevenue: totalRevenue,
          activeVenues: turfsSnapshot.size,
          totalCustomers: usersSnapshot.size,
          pendingBookings: pendingBookings.length,
          monthlyGrowth: 12.5, // Calculate based on actual data
          revenueGrowth: 8.3,  // Calculate based on actual data
          weeklyStats: [] // Generate based on actual data
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get bookings with pagination
  async getBookings(params = {}) {
    try {
      const bookingsRef = collection(db, 'bookings');
      let q = query(bookingsRef, orderBy('createdAt', 'desc'));
      
      if (params.filter && params.filter !== 'all') {
        q = query(q, where('status', '==', params.filter));
      }
      
      if (params.pageSize) {
        q = query(q, limit(parseInt(params.pageSize)));
      }
      
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        data: {
          data: bookings,
          total: bookings.length,
          page: parseInt(params.page) || 0,
          pageSize: parseInt(params.pageSize) || 25
        }
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }
};

export default {
  turfAPI,
  bookingAPI,
  teamAPI,
  adminAPI
};