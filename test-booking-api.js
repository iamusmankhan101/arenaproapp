import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

console.log('🧪 Testing Booking API - Available Slots...');

// Simulate the getAvailableSlots function
async function testGetAvailableSlots(turfId, date) {
  try {
    console.log(`🕐 Fetching available slots for venue ${turfId} on ${date}`);
    
    // First, get the venue's time slots from the venue document
    const venueRef = doc(db, 'venues', turfId);
    const venueSnap = await getDoc(venueRef);
    
    if (!venueSnap.exists()) {
      console.log(`❌ Venue ${turfId} not found`);
      return { data: [] };
    }
    
    const venueData = venueSnap.data();
    const venueTimeSlots = venueData.timeSlots || [];
    
    console.log(`📊 Venue "${venueData.name}" has ${venueTimeSlots.length} time slots configured`);
    
    if (venueTimeSlots.length === 0) {
      console.log('⚠️ No time slots configured for this venue');
      return { data: [] };
    }
    
    // Show first few time slots as example
    console.log('📋 Sample time slots:');
    venueTimeSlots.slice(0, 3).forEach(slot => {
      console.log(`   - ${slot.time || slot.startTime} to ${slot.endTime}: PKR ${slot.price} (Available: ${slot.available !== false})`);
    });
    
    return { data: venueTimeSlots };
  } catch (error) {
    console.error('❌ Error fetching available slots:', error);
    return { data: [] };
  }
}

async function runTest() {
  try {
    // Get all venues first
    console.log('📋 Fetching all venues...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} venues\n`);
    
    // Test with the first venue
    const firstVenue = snapshot.docs[0];
    const venueId = firstVenue.id;
    const venueData = firstVenue.data();
    
    console.log(`🏟️ Testing with venue: ${venueData.name} (ID: ${venueId})`);
    
    // Test for today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Testing for date: ${today}\n`);
    
    const result = await testGetAvailableSlots(venueId, today);
    
    if (result.data.length > 0) {
      console.log(`\n✅ SUCCESS: Found ${result.data.length} time slots for booking!`);
      console.log('💡 The booking API should work correctly in the mobile app.');
    } else {
      console.log('\n❌ ISSUE: No time slots returned');
      console.log('💡 This explains why time slots are not showing in the app.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTest();