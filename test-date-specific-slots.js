// Test Date-Specific Slots for Venue "New"
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');

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

// Simulate the updated mobile app's getAvailableSlots function
async function simulateUpdatedGetAvailableSlots(turfId, date) {
  try {
    console.log(`🕐 Mobile: Fetching available slots for venue ${turfId} on ${date}`);
    
    // First, get the venue's time slots from the venue document
    const venueRef = doc(db, 'venues', turfId);
    const venueSnap = await getDoc(venueRef);
    
    if (!venueSnap.exists()) {
      console.log(`❌ Mobile: Venue ${turfId} not found`);
      throw new Error('Venue not found');
    }
    
    const venueData = venueSnap.data();
    
    // Check if there are date-specific slots for the requested date
    let venueTimeSlots = [];
    
    if (venueData.dateSpecificSlots && venueData.dateSpecificSlots[date]) {
      // Use date-specific slots if they exist for this date
      venueTimeSlots = venueData.dateSpecificSlots[date];
      console.log(`📊 Mobile: Using date-specific slots for ${date}: ${venueTimeSlots.length} slots configured`);
    } else {
      // Fall back to general time slots
      venueTimeSlots = venueData.timeSlots || venueData.availableSlots || [];
      console.log(`📊 Mobile: Using general time slots: ${venueTimeSlots.length} slots configured`);
      console.log(`📊 Mobile: Using ${venueData.timeSlots ? 'timeSlots' : 'availableSlots'} field`);
    }
    
    if (venueTimeSlots.length === 0) {
      console.log('⚠️ Mobile: No time slots configured for this venue/date');
      return [];
    }
    
    // Filter to only show selected slots (admin-configured availability)
    const selectedSlots = venueTimeSlots.filter(slot => slot.selected !== false);
    console.log(`📊 Mobile: ${selectedSlots.length}/${venueTimeSlots.length} slots are selected by admin`);
    
    if (selectedSlots.length === 0) {
      console.log('⚠️ Mobile: No slots selected by admin for this venue/date');
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
    
    console.log(`✅ Mobile: Returning ${availableSlots.length} selected time slots`);
    
    // Log all slots for debugging
    if (availableSlots.length > 0) {
      console.log(`📋 Mobile: All slots:`, availableSlots.map(slot => 
        `${slot.time} - ${slot.endTime} (PKR ${slot.price})`
      ));
    }
    
    return availableSlots;
  } catch (error) {
    console.error('❌ Mobile: Error fetching available slots:', error);
    return [];
  }
}

async function testDateSpecificSlots() {
  try {
    console.log('🧪 TESTING DATE-SPECIFIC SLOTS FOR VENUE "NEW"');
    console.log('===============================================');
    
    const venueId = 'R2Zrx6FwCcCxEbPe0wVU'; // Venue "New"
    
    // Test different dates
    const testDates = [
      '2026-02-01', // Date with specific slots (17:00-23:00)
      '2026-02-02', // Date with different specific slots
      '2026-02-03', // Date without specific slots (should use general)
    ];
    
    for (const testDate of testDates) {
      console.log(`\n📅 TESTING DATE: ${testDate}`);
      console.log('================================');
      
      const mobileSlots = await simulateUpdatedGetAvailableSlots(venueId, testDate);
      
      console.log(`📱 Mobile App Result: ${mobileSlots.length} slots available`);
      
      if (mobileSlots.length > 0) {
        console.log('✅ SUCCESS: Mobile app would show time slots');
        console.log('   All slots:');
        mobileSlots.forEach((slot, i) => {
          console.log(`   ${i + 1}. ${slot.time} - ${slot.endTime} = PKR ${slot.price}`);
        });
      } else {
        console.log('❌ PROBLEM: Mobile app would show NO time slots');
      }
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testDateSpecificSlots().then(() => {
  console.log('🏁 Test finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});