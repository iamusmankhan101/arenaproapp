// Test Admin Time Slots Sync - Final Test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where } = require('firebase/firestore');

// Firebase config
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

// Simulate mobile app's getAvailableSlots function
async function simulateMobileGetAvailableSlots(turfId, date) {
  try {
    console.log(`🕐 Mobile Simulation: Fetching available slots for venue ${turfId} on ${date}`);
    
    // Get the venue's time slots from the venue document
    const venueRef = doc(db, 'venues', turfId);
    const venueSnap = await getDoc(venueRef);
    
    if (!venueSnap.exists()) {
      console.log(`❌ Mobile Simulation: Venue ${turfId} not found`);
      return [];
    }
    
    const venueData = venueSnap.data();
    
    // Use admin-configured time slots (prioritize timeSlots over availableSlots)
    let venueTimeSlots = venueData.timeSlots || venueData.availableSlots || [];
    
    console.log(`📊 Mobile Simulation: Venue has ${venueTimeSlots.length} time slots configured`);
    console.log(`📊 Mobile Simulation: Using ${venueData.timeSlots ? 'timeSlots' : 'availableSlots'} field`);
    
    if (venueTimeSlots.length === 0) {
      console.log('⚠️ Mobile Simulation: No time slots configured for this venue');
      return [];
    }
    
    // Filter to only show selected slots (admin-configured availability)
    const selectedSlots = venueTimeSlots.filter(slot => slot.selected !== false);
    console.log(`📊 Mobile Simulation: ${selectedSlots.length}/${venueTimeSlots.length} slots are selected by admin`);
    
    if (selectedSlots.length === 0) {
      console.log('⚠️ Mobile Simulation: No slots selected by admin for this venue');
      return [];
    }
    
    // For simulation, assume no bookings exist
    const availableSlots = selectedSlots.map(slot => {
      const slotTime = slot.time || slot.startTime;
      
      return {
        ...slot,
        time: slotTime,
        startTime: slotTime,
        available: true // Assume all slots are available for simulation
      };
    });
    
    console.log(`✅ Mobile Simulation: Returning ${availableSlots.length} selected time slots`);
    
    // Log sample slots for debugging
    if (availableSlots.length > 0) {
      console.log(`📋 Mobile Simulation: Sample slots:`, availableSlots.slice(0, 3).map(slot => 
        `${slot.time} - ${slot.endTime} (PKR ${slot.price}) [Available: ${slot.available}]`
      ));
    }
    
    return availableSlots;
  } catch (error) {
    console.error('❌ Mobile Simulation: Error fetching available slots:', error);
    return [];
  }
}

async function testTimeSlotSync() {
  try {
    console.log('🧪 TESTING ADMIN TIME SLOTS SYNC');
    console.log('=================================');
    
    // Get all active venues
    const venuesRef = collection(db, 'venues');
    const activeQuery = query(venuesRef, where('isActive', '==', true));
    const venuesSnapshot = await getDocs(activeQuery);
    
    console.log(`📊 Found ${venuesSnapshot.size} active venues to test`);
    console.log('');
    
    for (const venueDoc of venuesSnapshot.docs) {
      const venue = venueDoc.data();
      const venueId = venueDoc.id;
      
      console.log(`🏟️ TESTING VENUE: ${venue.name} (${venueId})`);
      console.log('================================================');
      
      // Test mobile app simulation
      const testDate = '2026-02-03'; // Tomorrow
      const mobileSlots = await simulateMobileGetAvailableSlots(venueId, testDate);
      
      console.log(`📱 Mobile App Result: ${mobileSlots.length} slots available`);
      
      if (mobileSlots.length > 0) {
        console.log('✅ SUCCESS: Mobile app would show time slots');
        console.log('   Sample slots:');
        mobileSlots.slice(0, 5).forEach((slot, i) => {
          console.log(`   ${i + 1}. ${slot.time} - ${slot.endTime} = PKR ${slot.price}`);
        });
        if (mobileSlots.length > 5) {
          console.log(`   ... and ${mobileSlots.length - 5} more slots`);
        }
      } else {
        console.log('❌ PROBLEM: Mobile app would show NO time slots');
        
        // Debug why no slots
        if (!venue.timeSlots && !venue.availableSlots) {
          console.log('   Reason: No timeSlots or availableSlots field in venue');
        } else if (venue.timeSlots && venue.timeSlots.length === 0) {
          console.log('   Reason: timeSlots field exists but is empty');
        } else if (venue.timeSlots) {
          const selectedCount = venue.timeSlots.filter(slot => slot.selected !== false).length;
          console.log(`   Reason: Only ${selectedCount}/${venue.timeSlots.length} slots are selected`);
        }
      }
      
      console.log('');
    }
    
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testTimeSlotSync().then(() => {
  console.log('🏁 Test finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});