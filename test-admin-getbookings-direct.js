// Test script to directly call the admin panel's getBookings function
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

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

// Exact copy of the admin panel's getBookings function
const getBookings = async (params = {}) => {
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
    
    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      
      // Get venue information
      const venue = venuesMap[bookingData.turfId] || {};
      
      // Transform booking data for admin panel display
      const transformedBooking = {
        id: doc.id,
        bookingId: bookingData.bookingReference || doc.id.slice(-6),
        customerName: bookingData.guestInfo?.name || bookingData.customerName || 'Guest User',
        customerPhone: bookingData.guestInfo?.phone || bookingData.customerPhone || 'N/A',
        customerEmail: bookingData.guestInfo?.email || bookingData.customerEmail || 'N/A',
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
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return {
      data: [],
      total: 0,
      page: parseInt(params.page) || 0,
      pageSize: parseInt(params.pageSize) || 25
    };
  }
};

async function testAdminGetBookings() {
  try {
    console.log('🧪 Testing admin panel getBookings function directly...');
    
    // Test with default parameters (same as admin panel)
    const result = await getBookings({
      page: 0,
      pageSize: 25,
      filter: 'all',
      search: ''
    });
    
    console.log('\n📊 Result from getBookings:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data.length > 0) {
      console.log('\n✅ SUCCESS: getBookings returned data');
      console.log(`📋 Found ${result.data.length} bookings`);
      console.log('🎯 Admin panel should display these bookings');
      
      // Check if the data structure matches what DataGrid expects
      const firstBooking = result.data[0];
      const requiredFields = ['id', 'bookingId', 'customerName', 'turfName', 'sport', 'dateTime', 'totalAmount', 'status'];
      
      console.log('\n🔍 Checking required fields for DataGrid:');
      requiredFields.forEach(field => {
        const hasField = firstBooking.hasOwnProperty(field) && firstBooking[field] !== undefined;
        console.log(`- ${field}: ${hasField ? '✅' : '❌'} (${firstBooking[field]})`);
      });
      
    } else {
      console.log('\n❌ PROBLEM: getBookings returned empty data');
      console.log('This explains why the admin panel shows no bookings');
    }
    
  } catch (error) {
    console.error('❌ Error testing getBookings:', error);
  }
}

testAdminGetBookings();