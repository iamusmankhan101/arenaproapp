// Debug Venue "New" Specific Time Slots Issue
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function debugVenueNew() {
  try {
    console.log('🔍 DEBUGGING VENUE "NEW" TIME SLOTS');
    console.log('===================================');
    
    // Get the "New" venue specifically
    const venueId = 'R2Zrx6FwCcCxEbPe0wVU'; // From previous debug output
    const venueRef = doc(db, 'venues', venueId);
    const venueSnap = await getDoc(venueRef);
    
    if (!venueSnap.exists()) {
      console.log('❌ Venue "New" not found!');
      return;
    }
    
    const venue = venueSnap.data();
    console.log(`🏟️ VENUE: ${venue.name}`);
    console.log(`   ID: ${venueId}`);
    console.log(`   Active: ${venue.isActive}`);
    console.log(`   Status: ${venue.status}`);
    console.log('');
    
    // Check all time slot related fields
    console.log('📅 TIME SLOTS ANALYSIS:');
    console.log('========================');
    
    if (venue.timeSlots) {
      console.log(`✅ timeSlots field exists: ${venue.timeSlots.length} slots`);
      console.log('   All timeSlots:');
      venue.timeSlots.forEach((slot, i) => {
        console.log(`   ${i + 1}. ${slot.time || slot.startTime} - ${slot.endTime} = PKR ${slot.price} [Selected: ${slot.selected !== false ? 'YES' : 'NO'}]`);
      });
      
      const selectedSlots = venue.timeSlots.filter(slot => slot.selected !== false);
      console.log(`   📊 Selected slots: ${selectedSlots.length}/${venue.timeSlots.length}`);
      
      if (selectedSlots.length > 0) {
        console.log('   Selected slots only:');
        selectedSlots.forEach((slot, i) => {
          console.log(`   ${i + 1}. ${slot.time || slot.startTime} - ${slot.endTime} = PKR ${slot.price}`);
        });
      }
    } else {
      console.log('❌ No timeSlots field found');
    }
    
    if (venue.availableSlots) {
      console.log(`✅ availableSlots field exists: ${venue.availableSlots.length} slots`);
      console.log('   All availableSlots:');
      venue.availableSlots.forEach((slot, i) => {
        console.log(`   ${i + 1}. ${slot.time || slot.startTime} - ${slot.endTime} = PKR ${slot.price} [Selected: ${slot.selected !== false ? 'YES' : 'NO'}]`);
      });
    } else {
      console.log('❌ No availableSlots field found');
    }
    
    if (venue.dateSpecificSlots) {
      console.log(`✅ dateSpecificSlots field exists: ${Object.keys(venue.dateSpecificSlots).length} dates`);
      Object.keys(venue.dateSpecificSlots).forEach(date => {
        const dateSlots = venue.dateSpecificSlots[date];
        const selectedDateSlots = dateSlots.filter(slot => slot.selected !== false);
        console.log(`   📅 ${date}: ${selectedDateSlots.length}/${dateSlots.length} slots selected`);
        
        if (selectedDateSlots.length > 0) {
          console.log(`      Selected slots for ${date}:`);
          selectedDateSlots.forEach((slot, i) => {
            console.log(`      ${i + 1}. ${slot.startTime} - ${slot.endTime} = PKR ${slot.price}`);
          });
        }
      });
    } else {
      console.log('❌ No dateSpecificSlots field found');
    }
    
    console.log('');
    console.log('🔍 EXPECTED VS ACTUAL:');
    console.log('======================');
    console.log('Expected from admin panel screenshot:');
    console.log('   - 17:00 - 18:00 = PKR 3000');
    console.log('   - 18:00 - 19:00 = PKR 3000');
    console.log('   - 19:00 - 20:00 = PKR 3000');
    console.log('   - 20:00 - 21:00 = PKR 3000');
    console.log('   - 21:00 - 22:00 = PKR 3000');
    console.log('   - 22:00 - 23:00 = PKR 3000');
    console.log('');
    
    // Check what mobile app would see
    console.log('📱 MOBILE APP SIMULATION:');
    console.log('=========================');
    
    let mobileSlots = venue.timeSlots || venue.availableSlots || [];
    if (mobileSlots.length > 0) {
      const selectedForMobile = mobileSlots.filter(slot => slot.selected !== false);
      console.log(`Mobile app would see: ${selectedForMobile.length} slots`);
      
      if (selectedForMobile.length > 0) {
        console.log('Mobile app slots:');
        selectedForMobile.forEach((slot, i) => {
          console.log(`   ${i + 1}. ${slot.time || slot.startTime} - ${slot.endTime} = PKR ${slot.price}`);
        });
      }
    } else {
      console.log('❌ Mobile app would see NO slots!');
    }
    
    console.log('');
    console.log('✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugVenueNew().then(() => {
  console.log('🏁 Debug finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});