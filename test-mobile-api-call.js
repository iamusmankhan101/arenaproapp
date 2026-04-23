import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Firebase config (same as mobile app)
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('📱 Testing EXACT Mobile App API Calls...');

// Helper function to serialize Firestore data (same as mobile app)
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

// Test the exact getNearbyTurfs function from mobile app
async function testGetNearbyTurfs() {
  try {
    console.log('🏟️ Testing getNearbyTurfs (HomeScreen API call)...');
    const turfsRef = collection(db, 'venues');
    const q = query(turfsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.size} active venues`);
    
    const turfs = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      const serializedData = serializeFirestoreData({
        id: doc.id,
        ...data,
        distance: 0,
        sport: Array.isArray(data.sports) ? data.sports[0] : (typeof data.sports === 'string' ? data.sports.split(',')[0].trim() : 'Unknown'),
        pricePerHour: data.pricing?.basePrice || 0,
        time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
      });
      
      turfs.push(serializedData);
    });
    
    console.log('✅ getNearbyTurfs would return:');
    turfs.forEach(turf => {
      console.log(`   - ${turf.name}: ${turf.timeSlots?.length || 0} time slots`);
    });
    
    return turfs;
  } catch (error) {
    console.error('❌ Error in getNearbyTurfs:', error);
    return [];
  }
}

// Test the exact getTurfDetails function from mobile app
async function testGetTurfDetails(turfId) {
  try {
    console.log(`\n🔍 Testing getTurfDetails for venue ${turfId}...`);
    const turfRef = doc(db, 'venues', turfId);
    const turfSnap = await getDoc(turfRef);
    
    if (!turfSnap.exists()) {
      console.log('❌ Venue not found');
      return null;
    }
    
    const data = turfSnap.data();
    const serializedData = serializeFirestoreData({
      id: turfSnap.id,
      ...data
    });
    
    console.log('✅ getTurfDetails would return:');
    console.log(`   - Name: ${serializedData.name}`);
    console.log(`   - Time Slots: ${serializedData.timeSlots?.length || 0}`);
    
    if (serializedData.timeSlots && serializedData.timeSlots.length > 0) {
      console.log('   - Sample slots:');
      serializedData.timeSlots.slice(0, 3).forEach(slot => {
        console.log(`     * ${slot.time || slot.startTime} - ${slot.endTime}: PKR ${slot.price}`);
      });
    } else {
      console.log('   ❌ NO TIME SLOTS in getTurfDetails response!');
    }
    
    return serializedData;
  } catch (error) {
    console.error('❌ Error in getTurfDetails:', error);
    return null;
  }
}

// Test the exact getAvailableSlots function from mobile app
async function testGetAvailableSlots(turfId, date) {
  try {
    console.log(`\n🕐 Testing getAvailableSlots for venue ${turfId} on ${date}...`);
    
    // First, get the venue's time slots from the venue document
    const venueRef = doc(db, 'venues', turfId);
    const venueSnap = await getDoc(venueRef);
    
    if (!venueSnap.exists()) {
      console.log(`❌ Venue ${turfId} not found`);
      return { data: [] };
    }
    
    const venueData = venueSnap.data();
    const venueTimeSlots = venueData.timeSlots || [];
    
    console.log(`📊 Venue has ${venueTimeSlots.length} time slots configured`);
    
    if (venueTimeSlots.length === 0) {
      console.log('❌ NO TIME SLOTS configured for this venue');
      return { data: [] };
    }
    
    // Try to get existing bookings (with fallback for index issues)
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
      
      console.log(`📋 Found ${bookedSlots.length} booked slots`);
    } catch (indexError) {
      console.log('⚠️ Index not ready, showing all slots as available');
      bookedSlots = [];
    }
    
    // Mark slots as available/unavailable based on bookings
    const availableSlots = venueTimeSlots.map(slot => ({
      ...slot,
      available: !bookedSlots.includes(slot.time || slot.startTime)
    }));
    
    console.log(`✅ getAvailableSlots would return ${availableSlots.length} slots`);
    console.log('   - Sample available slots:');
    availableSlots.slice(0, 3).forEach(slot => {
      console.log(`     * ${slot.time || slot.startTime} - ${slot.endTime}: PKR ${slot.price} (${slot.available ? 'Available' : 'Booked'})`);
    });
    
    return { data: availableSlots };
  } catch (error) {
    console.error('❌ Error in getAvailableSlots:', error);
    return { data: [] };
  }
}

async function runFullTest() {
  try {
    // Test 1: Get all venues (HomeScreen)
    const venues = await testGetNearbyTurfs();
    
    if (venues.length === 0) {
      console.log('❌ No venues returned from getNearbyTurfs');
      return;
    }
    
    // Test 2: Get details for first venue (TurfDetailScreen)
    const firstVenue = venues[0];
    const venueDetails = await testGetTurfDetails(firstVenue.id);
    
    if (!venueDetails) {
      console.log('❌ No venue details returned');
      return;
    }
    
    // Test 3: Get available slots (Booking Modal)
    const today = new Date().toISOString().split('T')[0];
    const slots = await testGetAvailableSlots(firstVenue.id, today);
    
    console.log('\n🎯 SUMMARY:');
    console.log(`✅ Venues found: ${venues.length}`);
    console.log(`✅ Venue details: ${venueDetails ? 'Success' : 'Failed'}`);
    console.log(`✅ Time slots: ${slots.data.length} returned`);
    
    if (slots.data.length === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: getAvailableSlots returns 0 slots');
      console.log('💡 This is why time slots don\'t show in the mobile app!');
    } else {
      console.log('\n✅ Time slots should be working in the mobile app');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runFullTest();