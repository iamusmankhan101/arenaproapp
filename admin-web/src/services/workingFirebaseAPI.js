// Working Firebase Admin API
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, query, orderBy, collectionGroup, deleteDoc } from 'firebase/firestore';

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
      console.log('📅 Admin: Fetching bookings...');
      const firestore = initFirebase();

      // Create query for bookings collection
      let bookingsQuery = collection(firestore, 'bookings');

      // Add ordering by creation date (newest first)
      try {
        bookingsQuery = query(bookingsQuery, orderBy('createdAt', 'desc'));
      } catch (orderError) {
        console.warn('⚠️ Admin: Could not order by createdAt, using simple query');
        // If ordering fails, use simple query
      }

      // Execute query
      const querySnapshot = await getDocs(bookingsQuery);

      // Process results
      const bookings = [];

      // Get venue names for better display
      const venuesRef = collection(firestore, 'venues');
      const venuesSnapshot = await getDocs(venuesRef);
      const venuesMap = {};
      venuesSnapshot.forEach((doc) => {
        venuesMap[doc.id] = doc.data();
      });

      // Fetch users map to resolve "Guest User" for authenticated bookings
      const usersRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersMap = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      querySnapshot.forEach((doc) => {
        const bookingData = doc.data();

        // Get venue information
        const venue = venuesMap[bookingData.turfId] || {};

        // Get user information if available
        const user = bookingData.userId ? usersMap[bookingData.userId] : null;

        // Transform booking data for admin panel display
        const transformedBooking = {
          id: doc.id,
          bookingId: bookingData.bookingReference || doc.id.slice(-6),
          customerName: bookingData.guestInfo?.name || bookingData.customerName || (user ? (user.fullName || user.displayName || user.name) : 'Guest User'),
          customerPhone: bookingData.guestInfo?.phone || bookingData.customerPhone || (user ? (user.phoneNumber || user.phone) : 'N/A'),
          customerEmail: bookingData.guestInfo?.email || bookingData.customerEmail || (user ? user.email : 'N/A'),
          turfName: venue.name || bookingData.turf?.name || 'Unknown Venue',
          turfArea: venue.area || venue.address || bookingData.turf?.address || 'N/A',
          sport: bookingData.sport || (venue.sports && venue.sports[0]) || 'Football',
          dateTime: bookingData.date ? (bookingData.date.toDate ? bookingData.date.toDate() : new Date(bookingData.date)) : new Date(),
          duration: bookingData.duration || 1,
          totalAmount: bookingData.totalAmount || 0,
          status: bookingData.status || 'pending',
          paymentStatus: bookingData.paymentStatus || 'pending',
          timeSlot: bookingData.timeSlot || bookingData.slot?.startTime || 'N/A',
          // Ensure dates are properly formatted
          createdAt: bookingData.createdAt?.toDate?.() || new Date(),
          updatedAt: bookingData.updatedAt?.toDate?.() || new Date(),
          // Additional fields for admin
          userId: bookingData.userId,
          userType: bookingData.userType || 'guest',
          turfId: bookingData.turfId,
          venueOwnerPhone: venue.contactPhone || venue.phoneNumber || null,
        };

        bookings.push(transformedBooking);
      });

      // Apply filters if specified
      let filteredBookings = bookings;

      if (params.filter && params.filter !== 'all') {
        if (params.filter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          filteredBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.dateTime);
            return bookingDate >= today && bookingDate < tomorrow;
          });
        } else {
          filteredBookings = bookings.filter(booking => booking.status === params.filter);
        }
      }

      // Apply search if specified
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          booking.customerName.toLowerCase().includes(searchLower) ||
          booking.turfName.toLowerCase().includes(searchLower) ||
          booking.bookingId.toLowerCase().includes(searchLower) ||
          booking.customerPhone.includes(params.search)
        );
      }

      // Apply pagination
      const startIndex = (parseInt(params.page) || 0) * (parseInt(params.pageSize) || 25);
      const endIndex = startIndex + (parseInt(params.pageSize) || 25);
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      const result = {
        data: paginatedBookings,
        total: filteredBookings.length,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };

      console.log(`✅ Admin: Bookings fetched: ${paginatedBookings.length}/${filteredBookings.length} bookings (${bookings.length} total)`);
      return result;

    } catch (error) {
      console.error('❌ Admin: Error fetching bookings:', error);
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };
    }
  },

  // Get customers
  async getCustomers(params = {}) {
    try {
      console.log('👥 Admin: Fetching customers...');
      const firestore = initFirebase();

      // Create query for users collection
      let usersQuery = collection(firestore, 'users');

      // Add ordering by creation date (newest first)
      try {
        usersQuery = query(usersQuery, orderBy('createdAt', 'desc'));
      } catch (orderError) {
        console.warn('⚠️ Admin: Could not order users by createdAt, using simple query');
        // If ordering fails, use simple query
      }

      // Execute query
      const querySnapshot = await getDocs(usersQuery);

      // Process results
      const customers = [];

      // Get bookings data to calculate customer stats
      let bookingsMap = {};
      try {
        const bookingsRef = collection(firestore, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);

        bookingsSnapshot.forEach((doc) => {
          const booking = doc.data();
          const userId = booking.userId;

          if (!bookingsMap[userId]) {
            bookingsMap[userId] = {
              totalBookings: 0,
              totalSpent: 0,
              lastBooking: null,
              preferredSports: new Set()
            };
          }

          bookingsMap[userId].totalBookings++;
          bookingsMap[userId].totalSpent += booking.totalAmount || 0;

          const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);
          if (!bookingsMap[userId].lastBooking || bookingDate > bookingsMap[userId].lastBooking) {
            bookingsMap[userId].lastBooking = bookingDate;
          }

          if (booking.sport) {
            bookingsMap[userId].preferredSports.add(booking.sport);
          }
        });

        // Convert Sets to Arrays
        Object.keys(bookingsMap).forEach(userId => {
          bookingsMap[userId].preferredSports = Array.from(bookingsMap[userId].preferredSports);
        });

      } catch (bookingError) {
        console.log('📅 Admin: No bookings found for customer stats calculation');
      }

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;
        const customerStats = bookingsMap[userId] || {
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: null,
          preferredSports: []
        };

        // Transform user data for admin panel display
        const transformedCustomer = {
          id: userId,
          name: userData.fullName || userData.displayName || userData.name || 'Unknown User',
          email: userData.email || 'N/A',
          phone: userData.phoneNumber || userData.phone || 'N/A',
          joinDate: userData.createdAt?.toDate?.() || new Date(),
          status: userData.isActive !== false ? 'active' : 'inactive',
          totalBookings: customerStats.totalBookings,
          totalSpent: customerStats.totalSpent,
          lastBooking: customerStats.lastBooking || userData.createdAt?.toDate?.() || new Date(),
          preferredSports: customerStats.preferredSports.length > 0 ? customerStats.preferredSports : ['Football'],
          rating: (4 + Math.random()).toFixed(1), // Mock rating for now
          isVip: customerStats.totalSpent > 50000 || userData.isVip === true,
          // Additional fields for admin
          profilePicture: userData.photoURL || null,
          address: userData.address || 'N/A',
          dateOfBirth: userData.dateOfBirth || null,
          // Ensure dates are properly formatted
          createdAt: userData.createdAt?.toDate?.() || new Date(),
          updatedAt: userData.updatedAt?.toDate?.() || new Date(),
        };

        customers.push(transformedCustomer);
      });

      // Apply filters if specified
      let filteredCustomers = customers;

      if (params.filter && params.filter !== 'all') {
        if (params.filter === 'active') {
          filteredCustomers = customers.filter(customer => customer.status === 'active');
        } else if (params.filter === 'inactive') {
          filteredCustomers = customers.filter(customer => customer.status === 'inactive');
        } else if (params.filter === 'vip') {
          filteredCustomers = customers.filter(customer => customer.isVip);
        } else if (params.filter === 'new') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredCustomers = customers.filter(customer =>
            new Date(customer.joinDate) >= thirtyDaysAgo
          );
        }
      }

      // Apply search if specified
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone.includes(params.search)
        );
      }

      // Apply pagination
      const startIndex = (parseInt(params.page) || 0) * (parseInt(params.pageSize) || 25);
      const endIndex = startIndex + (parseInt(params.pageSize) || 25);
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

      const result = {
        data: paginatedCustomers,
        total: filteredCustomers.length,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };

      console.log(`✅ Admin: Customers fetched: ${paginatedCustomers.length}/${filteredCustomers.length} customers (${customers.length} total)`);
      return result;

    } catch (error) {
      console.error('❌ Admin: Error fetching customers:', error);
      return {
        data: [],
        total: 0,
        page: parseInt(params.page) || 0,
        pageSize: parseInt(params.pageSize) || 25
      };
    }
  },

  // Add venue (working implementation)
  async addVenue(venueData) {
    try {
      console.log('➕ Admin: Adding venue:', {
        name: venueData.name,
        availableSlots: venueData.availableSlots?.length || 0,
        selectedSlots: venueData.availableSlots?.filter(slot => slot.selected !== false).length || 0
      });
      const firestore = initFirebase();

      // Process time slots - filter to only include selected slots and ensure proper structure
      let processedTimeSlots = [];
      if (venueData.availableSlots && Array.isArray(venueData.availableSlots)) {
        processedTimeSlots = venueData.availableSlots
          .filter(slot => slot.selected !== false) // Only include selected slots
          .map(slot => ({
            id: slot.id,
            time: slot.time || slot.startTime,
            startTime: slot.startTime || slot.time,
            endTime: slot.endTime,
            price: Number(slot.price) || Number(venueData.basePrice) || 0,
            available: true,
            selected: true // Mark as selected since we filtered for selected slots
          }));

        console.log(`📊 Admin: Processed ${processedTimeSlots.length} selected time slots for new venue`);
      }

      // Prepare venue data for Firestore with consistent structure
      const venueToAdd = {
        name: venueData.name,
        description: venueData.description || '',
        address: venueData.address,
        city: venueData.city || 'Lahore',
        area: venueData.area,
        sports: Array.isArray(venueData.sports) ? venueData.sports : [],
        facilities: Array.isArray(venueData.facilities) ? venueData.facilities : [],
        basePrice: Number(venueData.basePrice) || 1000,
        openTime: venueData.openTime || '06:00',
        closeTime: venueData.closeTime || '23:00',
        slotDuration: Number(venueData.slotDuration) || 60,
        images: Array.isArray(venueData.images) ? venueData.images : [],
        // Contact info
        contactPhone: venueData.contactPhone || '',
        // Location data structure
        location: {
          latitude: Number(venueData.latitude) || 31.5204,
          longitude: Number(venueData.longitude) || 74.3587,
          city: venueData.city || 'Lahore'
        },
        // Pricing structure
        pricing: {
          basePrice: Number(venueData.basePrice) || 1000
        },
        // Operating hours structure
        operatingHours: {
          open: venueData.openTime || '06:00',
          close: venueData.closeTime || '23:00'
        },
        // Time slots - use processed selected slots
        timeSlots: processedTimeSlots,
        // Include date-specific slots if provided
        ...(venueData.dateSpecificSlots && { dateSpecificSlots: venueData.dateSpecificSlots }),
        // Status and timestamps
        isActive: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(firestore, 'venues'), venueToAdd);

      console.log(`✅ Admin: Venue added successfully with ID: ${docRef.id} and ${processedTimeSlots.length} time slots`);
      return {
        success: true,
        message: 'Venue added successfully',
        id: docRef.id,
        data: { ...venueToAdd, id: docRef.id }
      };

    } catch (error) {
      console.error('❌ Admin: Error adding venue:', error);
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
      console.log('🔄 Admin: Updating venue:', venueId, {
        name: venueData.name,
        availableSlots: venueData.availableSlots?.length || 0,
        selectedSlots: venueData.availableSlots?.filter(slot => slot.selected !== false).length || 0
      });
      const firestore = initFirebase();

      const venueRef = doc(firestore, 'venues', venueId);

      // Process time slots - filter to only include selected slots and ensure proper structure
      let processedTimeSlots = [];
      if (venueData.availableSlots && Array.isArray(venueData.availableSlots)) {
        processedTimeSlots = venueData.availableSlots
          .filter(slot => slot.selected !== false) // Only include selected slots
          .map(slot => ({
            id: slot.id,
            time: slot.time || slot.startTime,
            startTime: slot.startTime || slot.time,
            endTime: slot.endTime,
            price: Number(slot.price) || Number(venueData.basePrice) || 0,
            available: true,
            selected: true // Mark as selected since we filtered for selected slots
          }));

        console.log(`📊 Admin: Processed ${processedTimeSlots.length} selected time slots for venue update`);
      }

      // Prepare update data with proper structure
      const updateData = {
        name: venueData.name,
        description: venueData.description || '',
        address: venueData.address,
        city: venueData.city || 'Lahore',
        area: venueData.area,
        sports: Array.isArray(venueData.sports) ? venueData.sports : [],
        facilities: Array.isArray(venueData.facilities) ? venueData.facilities : [],
        basePrice: Number(venueData.basePrice) || 0,
        openTime: venueData.openTime || '06:00',
        closeTime: venueData.closeTime || '23:00',
        slotDuration: Number(venueData.slotDuration) || 60,
        images: Array.isArray(venueData.images) ? venueData.images : [],
        // Contact info
        contactPhone: venueData.contactPhone || '',
        // Location data
        location: {
          latitude: Number(venueData.latitude) || 31.5204,
          longitude: Number(venueData.longitude) || 74.3587,
          city: venueData.city || 'Lahore'
        },
        // Pricing structure
        pricing: {
          basePrice: Number(venueData.basePrice) || 0
        },
        // Operating hours
        operatingHours: {
          open: venueData.openTime || '06:00',
          close: venueData.closeTime || '23:00'
        },
        // Time slots - use processed selected slots
        timeSlots: processedTimeSlots,
        // Include date-specific slots if provided
        ...(venueData.dateSpecificSlots && { dateSpecificSlots: venueData.dateSpecificSlots }),
        // Status and timestamps
        isActive: true,
        status: 'active',
        updatedAt: new Date()
      };

      await updateDoc(venueRef, updateData);

      console.log(`✅ Admin: Venue updated successfully with ${processedTimeSlots.length} time slots`);
      return {
        id: venueId,
        ...updateData,
        success: true,
        message: 'Venue updated successfully'
      };
    } catch (error) {
      console.error('❌ Admin: Error updating venue:', error);
      throw new Error(`Failed to update venue: ${error.message}`);
    }
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      console.log('🔄 Admin: Updating booking status:', bookingId, status);
      const firestore = initFirebase();

      const bookingRef = doc(firestore, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: status,
        updatedAt: new Date(),
        // Update payment status based on booking status
        ...(status === 'confirmed' && { paymentStatus: 'paid' }),
        ...(status === 'cancelled' && { paymentStatus: 'refunded' })
      });

      console.log('✅ Admin: Booking status updated successfully');
      return { success: true, message: 'Booking status updated successfully' };
    } catch (error) {
      console.error('❌ Admin: Error updating booking status:', error);
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  },

  // Update customer status
  async updateCustomerStatus(customerId, status) {
    try {
      console.log('🔄 Admin: Updating customer status:', customerId, status);
      const firestore = initFirebase();

      const customerRef = doc(firestore, 'users', customerId);
      await updateDoc(customerRef, {
        isActive: status === 'active',
        status: status,
        updatedAt: new Date()
      });

      console.log('✅ Admin: Customer status updated successfully');
      return { success: true, message: 'Customer status updated successfully' };
    } catch (error) {
      console.error('❌ Admin: Error updating customer status:', error);
      throw new Error(`Failed to update customer status: ${error.message}`);
    }
  }
  ,

  // Get all reviews (using Collection Group Query)
  async getReviews(params = {}) {
    try {
      console.log('⭐ Admin: Fetching all reviews...');
      const firestore = initFirebase();

      // Query 'reviews' collection group across all venues
      let reviewsQuery = collectionGroup(firestore, 'reviews');

      // Order by date desc
      try {
        reviewsQuery = query(reviewsQuery, orderBy('date', 'desc'));
      } catch (e) {
        console.warn('Could not order reviews by date (might need index)', e);
      }

      const snapshot = await getDocs(reviewsQuery);
      const reviews = [];

      // We need to fetch venue names effectively.
      // Since reviews are subcollections of venues, the parent doc of a review is the venue.
      // However, we can't easily get parent data from collectionGroup query result directly in a single shot without refs.
      // For optimization, we might just show Venue ID or fetch venues if needed.
      // Let's try to map them if we have venues cached or just fetch them.

      // For now, let's fetch all venues to map IDs to Names (assuming < 100 venues this is fine)
      const venuesRef = collection(firestore, 'venues');
      const venuesSnap = await getDocs(venuesRef);
      const venueMap = {};
      venuesSnap.forEach(v => venueMap[v.id] = v.data().name);

      snapshot.forEach(doc => {
        const data = doc.data();
        // Construct venueId from ref path: venues/{venueId}/reviews/{reviewId}
        const venueId = doc.ref.parent.parent?.id;

        reviews.push({
          id: doc.id,
          ...data,
          venueId: venueId,
          venueName: venueMap[venueId] || 'Unknown Venue',
          date: data.date?.toDate?.() || new Date(),
        });
      });

      console.log(`✅ Admin: Fetched ${reviews.length} reviews`);
      return {
        data: reviews,
        total: reviews.length
      };

    } catch (error) {
      console.error('❌ Admin: Error fetching reviews:', error);
      return { data: [], total: 0 };
    }
  },

  // Update review status
  async updateReviewStatus(venueId, reviewId, status) {
    try {
      console.log(`🔄 Admin: Updating review ${reviewId} status to ${status}`);
      const firestore = initFirebase();
      const reviewRef = doc(firestore, 'venues', venueId, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: status,
        updatedAt: new Date()
      });
      return { success: true, status };
    } catch (error) {
      console.error('❌ Admin: Error updating review status:', error);
      throw error;
    }
  },

  // Delete review (moderation)
  async deleteReview(venueId, reviewId) {
    try {
      console.log(`🗑️ Admin: Deleting review ${reviewId} from venue ${venueId}`);
      const firestore = initFirebase();
      const reviewRef = doc(firestore, 'venues', venueId, 'reviews', reviewId);
      await deleteDoc(reviewRef);
      return { success: true };
    } catch (error) {
      console.error('❌ Admin: Error deleting review:', error);
      throw error;
    }
  }
};

export default workingAdminAPI;