import { getDocs, addDoc, doc, getDoc, updateDoc, query, orderBy, collection, collectionGroup, deleteDoc, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const initFirebase = () => {
  return db;
};

// Working Admin API
export const workingAdminAPI = {
  // Get dashboard stats
  async getDashboardStats(params = {}) {
    try {
      console.log('🔥 Fetching dashboard stats...', params);
      const firestore = initFirebase();

      // Fetch venues count
      let venuesQuery = collection(firestore, 'venues');
      if (params.vendorId) {
        venuesQuery = query(venuesQuery, where('vendorId', '==', params.vendorId));
      }
      const venuesSnapshot = await getDocs(venuesQuery);
      const totalVenues = venuesSnapshot.size;
      const activeVenues = venuesSnapshot.docs.filter(doc =>
        doc.data().status === 'active'
      ).length;

      const vendorVenueIds = new Set(venuesSnapshot.docs.map(doc => doc.id));

      // Fetch bookings count
      const vendorCustomers = new Set();
      let totalBookings = 0;
      let todayBookings = 0;
      let pendingBookings = 0;
      let totalRevenue = 0;

      // Initialize weekly map
      const weeklyMap = {
        'Mon': { bookings: 0, revenue: 0 },
        'Tue': { bookings: 0, revenue: 0 },
        'Wed': { bookings: 0, revenue: 0 },
        'Thu': { bookings: 0, revenue: 0 },
        'Fri': { bookings: 0, revenue: 0 },
        'Sat': { bookings: 0, revenue: 0 },
        'Sun': { bookings: 0, revenue: 0 },
      };

      try {
        const bookingsQuery = collection(firestore, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsQuery);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        bookingsSnapshot.docs.forEach(doc => {
          const booking = doc.data();

          // Filter by vendor if needed
          if (params.vendorId && !vendorVenueIds.has(booking.turfId)) {
            return;
          }

          totalBookings++;

          const bookingDate = booking.createdAt?.toDate?.() || new Date(booking.createdAt);


          // Calculate usage for weekly stats
          const bookingAmt = parseFloat(booking.totalAmount || booking.amount || 0);
          totalRevenue += bookingAmt;

          // Weekly Stats (last 7 days)
          const diffTime = Math.abs(today - bookingDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 7) {
            const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'short' });
            if (weeklyMap[dayName]) {
              weeklyMap[dayName].bookings++;
              weeklyMap[dayName].revenue += bookingAmt;
            }
          }


          // Count today's bookings
          if (bookingDate >= today) {
            todayBookings++;
          }

          // Count pending bookings
          if (booking.status === 'pending') {
            pendingBookings++;
          }

          if (params.vendorId && booking.userId) {
            vendorCustomers.add(booking.userId);
          }
        });

      } catch (bookingError) {
        console.log('📅 No bookings collection found, using default values');
      }

      // Format weekly stats for chart (Mon-Sun)
      const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyStats = daysOrder.map(day => ({
        day,
        bookings: weeklyMap[day]?.bookings || 0,
        revenue: weeklyMap[day]?.revenue || 0
      }));

      // Fetch customers count
      let totalCustomers = 0;
      try {
        const usersQuery = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersQuery);

        if (params.vendorId) {
          totalCustomers = vendorCustomers.size;
        } else {
          totalCustomers = usersSnapshot.size;
        }
      } catch (userError) {
        console.log('👥 No users collection found, using default values');
      }

      const stats = {
        totalBookings,
        todayBookings,
        totalRevenue,
        activeVenues,
        totalVenues,
        totalCustomers,
        pendingBookings,
        monthlyGrowth: 0,
        revenueGrowth: 0,
        weeklyStats
      };

      // Fetch recent activity
      const recentActivity = [];

      // Add recent bookings (last 5)
      try {
        const bookingsQuery = query(
          collection(firestore, 'bookings'),
          orderBy('createdAt', 'desc'),
          // limit(5) // Limit not supported with collectionGroup in some cases, so slice later
        );
        const bookingsSnap = await getDocs(bookingsQuery);

        bookingsSnap.docs.slice(0, 5).forEach(doc => {
          const booking = doc.data();
          // Filter by vendor if needed
          if (params.vendorId && !vendorVenueIds.has(booking.turfId)) return;

          recentActivity.push({
            type: 'booking',
            text: `New booking for ${booking.sport || 'Sports'}`,
            subText: booking.customerName || 'Guest User',
            time: booking.createdAt?.toDate?.() || new Date(booking.createdAt),
            status: booking.status || 'pending',
            id: doc.id
          });
        });
      } catch (e) {
        console.warn('Could not fetch recent bookings', e);
      }

      // Add recent users (last 5)
      try {
        if (!params.vendorId) {
          const usersQuery = query(
            collection(firestore, 'users'),
            orderBy('createdAt', 'desc')
          );
          const usersSnap = await getDocs(usersQuery);

          usersSnap.docs.slice(0, 5).forEach(doc => {
            const user = doc.data();
            recentActivity.push({
              type: 'user',
              text: `New customer registered`,
              subText: user.fullName || user.displayName || 'New User',
              time: user.createdAt?.toDate?.() || new Date(user.createdAt),
              status: 'New',
              id: doc.id
            });
          });
        }
      } catch (e) {
        console.warn('Could not fetch recent users', e);
      }

      // Sort combined activity by time desc and take top 5
      stats.recentActivity = recentActivity
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

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

      // Apply vendor filter if provided
      if (params.vendorId) {
        venuesQuery = query(venuesQuery, where('vendorId', '==', params.vendorId));
      } else {
        // Only use orderBy when there's no where clause (avoids composite index requirement)
        venuesQuery = query(venuesQuery, orderBy('createdAt', 'desc'));
      }

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

      // Sort client-side when vendorId filter was used (no server-side orderBy)
      if (params.vendorId) {
        venues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

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
      }

      // Execute query
      const querySnapshot = await getDocs(bookingsQuery);

      // Process results
      const bookings = [];

      // Get venue names and filter set
      const venuesRef = collection(firestore, 'venues');
      const venuesSnapshot = await getDocs(venuesRef);
      const venuesMap = {};
      const vendorVenueIds = new Set();

      venuesSnapshot.forEach((doc) => {
        const venueData = doc.data();
        venuesMap[doc.id] = venueData;
        if (params.vendorId && venueData.vendorId === params.vendorId) {
          vendorVenueIds.add(doc.id);
        }
      });

      // Fetch users map
      const usersRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersMap = {};
      usersSnapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      querySnapshot.forEach((doc) => {
        const bookingData = doc.data();

        // Vendor Filter
        if (params.vendorId && !vendorVenueIds.has(bookingData.turfId)) {
          return;
        }

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
        // Vendor Link
        vendorId: venueData.vendorId || null,
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
        // Vendor Link
        vendorId: venueData.vendorId || null,
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
  },

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

      // For now, let's fetch all venues to map IDs to Names
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
  },

  // Get all vendors from users collection
  async getVendors() {
    try {
      console.log('👥 Admin: Fetching vendors from users collection...');
      const firestore = db;
      const usersRef = collection(firestore, 'users');
      const vendorsQuery = query(usersRef, where('role', '==', 'vendor'));
      const snapshot = await getDocs(vendorsQuery);

      const vendors = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        vendors.push({
          id: docSnap.id,
          name: data.fullName || data.displayName || data.name || data.businessName || data.email || 'Unnamed',
          email: data.email || 'N/A',
          phone: data.phone || data.phoneNumber || 'N/A',
          role: data.role || 'vendor',
          proActive: data.proActive || false,
          proActivatedAt: data.proActivatedAt || null,
          proPricePerMonth: data.proPricePerMonth || null,
          createdAt: data.createdAt,
        });
      });

      console.log(`✅ Admin: Found ${vendors.length} vendors`);
      return vendors;
    } catch (error) {
      console.error('❌ Admin: Error fetching vendors:', error);
      throw error;
    }
  },

  // Toggle vendor Pro status
  async toggleVendorPro(vendorId, activate) {
    try {
      const firestore = db;
      const vendorRef = doc(firestore, 'users', vendorId);
      await updateDoc(vendorRef, {
        proActive: activate,
        proActivatedAt: activate ? new Date().toISOString() : null,
        proPricePerMonth: 2000,
      });
      return { success: true, vendorId, activate };
    } catch (error) {
      console.error('❌ Admin: Error toggling vendor Pro:', error);
      throw error;
    }
  },

  // Create Manual Booking
  async createBooking(bookingData) {
    try {
      console.log('📅 Admin: Creating new booking...', bookingData);
      const firestore = db;

      // 1. Create Booking Document
      const bookingPayload = {
        ...bookingData,
        date: Timestamp.fromDate(new Date(bookingData.date)), // Store as Timestamp for consistency
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'confirmed', // Manual bookings are confirmed
        paymentStatus: 'pending',
        origin: 'admin_panel'
      };

      const bookingRef = await addDoc(collection(firestore, 'bookings'), bookingPayload);
      console.log('✅ Booking created with ID:', bookingRef.id);

      // 2. Notification Logic
      try {
        const vendorId = bookingData.vendorId;

        // Fetch Vendor Profile & Settings
        let isPro = false;
        let vendorPhone = null;
        let vendorEmail = null;
        let settings = {};

        if (vendorId) {
          const vendorDoc = await getDoc(doc(firestore, 'users', vendorId));
          if (vendorDoc.exists()) {
            const vData = vendorDoc.data();
            isPro = vData.proActive || false;
            vendorPhone = vData.phone || vData.phoneNumber;
            vendorEmail = vData.email;
          }

          // Fetch WhatsApp Settings only if Pro
          if (isPro) {
            const settingsRef = collection(firestore, 'whatsapp_settings');
            const q = query(settingsRef, where('vendorId', '==', vendorId));
            const settingsSnap = await getDocs(q);
            settings = settingsSnap.empty ? {} : settingsSnap.docs[0].data();
          }
        }

        // --- Common: Email to Customer (Simulated) ---
        // "and also emails to user for now"
        if (bookingData.customerEmail || bookingData.customerName) {
          console.log(`📧 Email to Customer (${bookingData.customerEmail || 'No Email'}): Hi ${bookingData.customerName}, your booking is confirmed!`);
        }

        // --- Conditional Logic ---
        if (isPro) {
          // === PRO VENDOR: WhatsApp ===

          // Send to Vendor (if enabled)
          if (settings.vendorNotification && vendorPhone) {
            console.log(`📲 WhatsApp to Vendor (${vendorPhone}): New Booking!`);
            await addDoc(collection(firestore, 'whatsapp_logs'), {
              vendorId,
              recipientPhone: vendorPhone,
              message: `New Booking! ${bookingData.customerName} booked ${bookingData.turfName} on ${new Date(bookingData.date).toLocaleDateString()}`,
              type: 'vendor_notification',
              status: 'sent',
              sentAt: new Date().toISOString()
            });
          }

          // Send to Customer
          if (bookingData.customerPhone) {
            console.log(`📲 WhatsApp to Customer (${bookingData.customerPhone}): Booking Confirmed!`);
            await addDoc(collection(firestore, 'whatsapp_logs'), {
              vendorId,
              recipientPhone: bookingData.customerPhone,
              message: `Hi ${bookingData.customerName}, your booking at ${bookingData.turfName} is confirmed!`,
              type: 'booking_confirmation',
              status: 'sent',
              sentAt: new Date().toISOString()
            });
          }
        } else {
          // === NON-PRO VENDOR: Email ===

          // Send Email to Vendor (Simulated)
          if (vendorEmail) {
            console.log(`📧 Email to Vendor (${vendorEmail}): New Booking Alert! (Non-Pro Fallback)`);
          } else {
            console.log(`📧 Email to Vendor (Unknown Email}): New Booking Alert! (Non-Pro Fallback)`);
          }
        }

      } catch (waError) {
        console.error('⚠️ Notification error:', waError);
      }

      return { success: true, id: bookingRef.id };
    } catch (error) {
      console.error('❌ Admin: Error creating booking:', error);
      throw error;
    }
  },

  // Create Promo
  async createPromo(venueId, promoData) {
    try {
      console.log('📣 Admin: Creating promo for venue:', venueId, promoData);
      const firestore = db;
      const promosRef = collection(firestore, 'venues', venueId, 'promos');

      const promoPayload = {
        ...promoData,
        createdAt: new Date(),
        status: 'active',
        vendorId: promoData.vendorId // Ensure vendorId is attached
      };

      const docRef = await addDoc(promosRef, promoPayload);
      console.log('✅ Promo created with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Admin: Error creating promo:', error);
      throw error;
    }
  },

  // Get Marketing Stats (Mock for now)
  async getMarketingStats(vendorId) {
    try {
      console.log('📊 Fetching marketing stats for vendor:', vendorId);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock Data
      return {
        organicViews: 1250,
        boostedViews: 3400, // Priority Placement effect
        dealClicks: 450,
        ctr: '12.5%',
        topVenueRank: '#1 in Futsal'
      };
    } catch (error) {
      console.error('❌ Error fetching marketing stats:', error);
      return null;
    }
  },

  // Create Push Campaign
  async createPushCampaign(campaignData) {
    try {
      console.log('📲 Admin: Creating push campaign:', campaignData);
      const firestore = db;
      const campaignsRef = collection(firestore, 'push_campaigns');

      const campaignPayload = {
        ...campaignData,
        createdAt: new Date(),
        status: 'scheduled', // or 'sent' immediately
        reach: Math.floor(Math.random() * 500) + 100, // Mock reach for now
      };

      const docRef = await addDoc(campaignsRef, campaignPayload);
      console.log('✅ Push campaign created with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Admin: Error creating push campaign:', error);
      throw error;
    }
  },

  // Get Push Quota (Mock)
  async getPushQuota(vendorId) {
    try {
      console.log('📊 Fetching push quota for vendor:', vendorId);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock Quota: 5 total, random used
      // In a real app, count documents in 'push_campaigns' where vendorId == vendorId AND date is this month
      return {
        limit: 5,
        used: 2, // Mock: Vendor has used 2 campaigns
        remaining: 3
      };
    } catch (error) {
      console.error('❌ Error fetching push quota:', error);
      return { limit: 5, used: 0, remaining: 5 };
    }
  }
};

export default workingAdminAPI;