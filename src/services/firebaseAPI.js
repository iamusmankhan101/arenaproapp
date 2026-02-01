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
      if (!user) {
        // Return false if user is not authenticated instead of throwing error
        console.log('⚠️ User not authenticated, cannot toggle favorite');
        return { data: { isFavorite: false, message: 'Please sign in to add favorites' } };
      }
      
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
      // Return false instead of throwing error to prevent app crashes
      return { data: { isFavorite: false, error: error.message } };
    }
  },

  // Get user favorites
  async getFavorites() {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Return empty array if user is not authenticated instead of throwing error
        console.log('⚠️ User not authenticated, returning empty favorites');
        return { data: [] };
      }
      
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
      // Return empty array instead of throwing error to prevent app crashes
      return { data: [] };
    }
  }
};

// Booking API
export const bookingAPI = {
  // Get available slots
  async getAvailableSlots(turfId, date) {
    try {
      console.log(`🕐 Fetching available slots for venue ${turfId} on ${date}`);
      
      // First, get the venue's time slots from the venue document
      const venueRef = doc(db, 'venues', turfId);
      const venueSnap = await getDoc(venueRef);
      
      if (!venueSnap.exists()) {
        console.log(`❌ Venue ${turfId} not found`);
        throw new Error('Venue not found');
      }
      
      const venueData = venueSnap.data();
      const venueTimeSlots = venueData.timeSlots || [];
      
      console.log(`📊 Venue has ${venueTimeSlots.length} time slots configured`);
      
      if (venueTimeSlots.length === 0) {
        console.log('⚠️ No time slots configured for this venue');
        return { data: [] };
      }
      
      // Try to get existing bookings for this date (with fallback for index issues)
      let bookedSlots = [];
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
        bookedSlots = snapshot.docs.map(doc => {
          const booking = doc.data();
          return booking.timeSlot || booking.slot?.startTime;
        }).filter(Boolean);
        
        console.log(`📋 Found ${bookedSlots.length} booked slots:`, bookedSlots);
      } catch (indexError) {
        console.warn('⚠️ Firestore index not ready yet, showing all slots as available:', indexError.message);
        // If index is not ready, show all slots as available
        bookedSlots = [];
      }
      
      // Mark slots as available/unavailable based on bookings
      const availableSlots = venueTimeSlots.map(slot => ({
        ...slot,
        available: !bookedSlots.includes(slot.time || slot.startTime)
      }));
      
      console.log(`✅ Returning ${availableSlots.length} time slots (${availableSlots.filter(s => s.available).length} available)`);
      
      return { data: availableSlots };
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      throw error;
    }
  },

  // Create booking
  async createBooking(bookingData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ User not authenticated, creating guest booking');
        // For guest bookings, we'll use a temporary guest ID
        const guestId = `guest_${Date.now()}`;
        
        const bookingRef = await addDoc(collection(db, 'bookings'), {
          ...bookingData,
          userId: guestId,
          userType: 'guest',
          status: 'pending', // Guest bookings start as pending
          paymentStatus: 'pending',
          bookingReference: `PIT${Date.now().toString().slice(-6)}`,
          createdAt: serverTimestamp(),
          guestInfo: {
            requiresSignIn: true,
            message: 'Please sign in to complete your booking'
          }
        });
        
        return { 
          data: { 
            id: bookingRef.id, 
            ...bookingData,
            status: 'pending',
            paymentStatus: 'pending',
            bookingReference: `PIT${Date.now().toString().slice(-6)}`,
            requiresSignIn: true,
            message: 'Booking created! Please sign in to complete your booking.'
          } 
        };
      }
      
      // Authenticated user booking
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        userId: user.uid,
        userType: 'authenticated',
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
          paymentStatus: 'paid',
          bookingReference: `PIT${Date.now().toString().slice(-6)}`,
          requiresSignIn: false,
          message: 'Booking confirmed successfully!'
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
      if (!user) {
        console.log('⚠️ User not authenticated, returning empty bookings');
        return { data: [] };
      }
      
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
      return { data: [] };
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
      if (!user) {
        console.log('⚠️ User not authenticated, cannot create challenge');
        throw new Error('Please sign in to create a challenge');
      }
      
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
      if (!user) {
        console.log('⚠️ User not authenticated, cannot accept challenge');
        throw new Error('Please sign in to accept a challenge');
      }
      
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