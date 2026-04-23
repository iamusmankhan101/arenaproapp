// Debug Admin Time Slots Sync - Final Test
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

async function debugTimeSlots() {
  try {
    console.log('🔍 DEBUGGING ADMIN TIME SLOTS SYNC');
    console.log('=====================================');
    
    // Get all venues
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    
    console.log(`📊 Found ${venuesSnapshot.size} venues in database`);
    console.log('');
    
    venuesSnapshot.forEach((doc, index) => {
      const venue = doc.data();
      console.log(`🏟️ VENUE ${index + 1}: ${venue.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Active: ${venue.isActive}`);
      console.log(`   Status: ${venue.status}`);
      
      // Check time slots structure
      console.log('   📅 TIME SLOTS ANALYSIS:');
      
      if (venue.timeSlots) {
        console.log(`   ✅ Has timeSlots field: ${venue.timeSlots.length} slots`);
        venue.timeSlots.forEach((slot, i) => {
          console.log(`      Slot ${i + 1}: ${slot.time || slot.startTime} - ${slot.endTime} (PKR ${slot.price}) [Selected: ${slot.selected !== false}]`);
        });
      } else {
        console.log('   ❌ No timeSlots field found');
      }
      
      if (venue.availableSlots) {
        console.log(`   ✅ Has availableSlots field: ${venue.availableSlots.length} slots`);
        venue.availableSlots.forEach((slot, i) => {
          console.log(`      Slot ${i + 1}: ${slot.time || slot.startTime} - ${slot.endTime} (PKR ${slot.price}) [Selected: ${slot.selected !== false}]`);
        });
      } else {
        console.log('   ❌ No availableSlots field found');
      }
      
      if (venue.dateSpecificSlots) {
        console.log(`   ✅ Has dateSpecificSlots field: ${Object.keys(venue.dateSpecificSlots).length} dates`);
        Object.keys(venue.dateSpecificSlots).forEach(date => {
          const dateSlots = venue.dateSpecificSlots[date];
          const selectedSlots = dateSlots.filter(slot => slot.selected !== false);
          console.log(`      ${date}: ${selectedSlots.length}/${dateSlots.length} slots selected`);
        });
      } else {
        console.log('   ❌ No dateSpecificSlots field found');
      }
      
      // Check operating hours
      console.log('   🕐 OPERATING HOURS:');
      if (venue.operatingHours) {
        console.log(`   ✅ Operating Hours: ${venue.operatingHours.open} - ${venue.operatingHours.close}`);
      } else if (venue.openTime && venue.closeTime) {
        console.log(`   ✅ Open/Close Times: ${venue.openTime} - ${venue.closeTime}`);
      } else {
        console.log('   ❌ No operating hours found');
      }
      
      // Check pricing
      console.log('   💰 PRICING:');
      if (venue.pricing?.basePrice) {
        console.log(`   ✅ Base Price: PKR ${venue.pricing.basePrice}`);
      } else if (venue.basePrice) {
        console.log(`   ✅ Base Price: PKR ${venue.basePrice}`);
      } else {
        console.log('   ❌ No base price found');
      }
      
      console.log('   ----------------------------------------');
      console.log('');
    });
    
    // Test mobile app query
    console.log('📱 TESTING MOBILE APP QUERY');
    console.log('============================');
    
    const mobileQuery = query(venuesRef, where('isActive', '==', true));
    const mobileSnapshot = await getDocs(mobileQuery);
    
    console.log(`📊 Mobile app would see ${mobileSnapshot.size} active venues`);
    
    mobileSnapshot.forEach((doc, index) => {
      const venue = doc.data();
      console.log(`📱 Mobile Venue ${index + 1}: ${venue.name}`);
      
      // Check what mobile app would use for time slots
      const mobileTimeSlots = venue.timeSlots || venue.availableSlots || [];
      console.log(`   Time Slots Available: ${mobileTimeSlots.length}`);
      
      if (mobileTimeSlots.length > 0) {
        console.log('   Sample slots:');
        mobileTimeSlots.slice(0, 3).forEach((slot, i) => {
          console.log(`      ${slot.time || slot.startTime} - ${slot.endTime} (PKR ${slot.price})`);
        });
        if (mobileTimeSlots.length > 3) {
          console.log(`      ... and ${mobileTimeSlots.length - 3} more slots`);
        }
      } else {
        console.log('   ❌ No time slots would be available in mobile app!');
      }
      
      console.log('');
    });
    
    console.log('✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugTimeSlots().then(() => {
  console.log('🏁 Debug finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});