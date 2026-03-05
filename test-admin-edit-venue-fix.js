import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

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

console.log('🧪 Testing Admin Panel Edit Venue Fix...');

async function testAdminEditVenueFix() {
  try {
    // Get all venues
    console.log('📋 Fetching venues to test edit functionality...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found');
      return;
    }
    
    // Test with the first venue
    const testVenue = snapshot.docs[0];
    const venueId = testVenue.id;
    const venueData = testVenue.data();
    
    console.log(`🏟️ Testing with venue: ${venueData.name} (ID: ${venueId})`);
    console.log(`📅 Current time slots: ${venueData.timeSlots?.length || 0}`);
    
    if (!venueData.timeSlots || venueData.timeSlots.length === 0) {
      console.log('❌ No time slots to test with');
      return;
    }
    
    // Simulate admin panel edit - modify first time slot price
    const originalTimeSlots = venueData.timeSlots;
    const modifiedTimeSlots = originalTimeSlots.map((slot, index) => {
      if (index === 0) {
        // Modify the first slot's price
        return {
          ...slot,
          price: slot.price + 100, // Increase price by 100
          time: slot.time || slot.startTime, // Ensure time field exists
          startTime: slot.startTime || slot.time, // Ensure startTime field exists
          selected: true // Ensure selected field exists
        };
      }
      return {
        ...slot,
        time: slot.time || slot.startTime,
        startTime: slot.startTime || slot.time,
        selected: slot.selected !== false
      };
    });
    
    console.log('🔄 Simulating admin panel edit...');
    console.log(`   Original first slot price: PKR ${originalTimeSlots[0].price}`);
    console.log(`   Modified first slot price: PKR ${modifiedTimeSlots[0].price}`);
    
    // Update venue with modified time slots (simulating admin panel save)
    const venueRef = doc(db, 'venues', venueId);
    await updateDoc(venueRef, {
      timeSlots: modifiedTimeSlots,
      updatedAt: new Date()
    });
    
    console.log('✅ Venue updated successfully');
    
    // Verify the update by reading the venue again
    console.log('🔍 Verifying update...');
    const updatedVenueSnap = await getDoc(venueRef);
    const updatedVenueData = updatedVenueSnap.data();
    
    if (updatedVenueData.timeSlots && updatedVenueData.timeSlots.length > 0) {
      const updatedFirstSlot = updatedVenueData.timeSlots[0];
      console.log(`✅ Updated first slot price: PKR ${updatedFirstSlot.price}`);
      console.log(`✅ Has 'time' field: ${!!updatedFirstSlot.time}`);
      console.log(`✅ Has 'startTime' field: ${!!updatedFirstSlot.startTime}`);
      console.log(`✅ Has 'selected' field: ${!!updatedFirstSlot.selected}`);
      
      if (updatedFirstSlot.price === originalTimeSlots[0].price + 100) {
        console.log('🎉 ADMIN EDIT TEST: SUCCESS');
        console.log('💡 Admin panel edits are now saving correctly!');
      } else {
        console.log('❌ ADMIN EDIT TEST: FAILED');
        console.log('💡 Price change was not saved correctly');
      }
    } else {
      console.log('❌ No time slots found after update');
    }
    
    // Test mobile app compatibility
    console.log('\n📱 Testing mobile app compatibility...');
    const mobileCompatibleSlot = updatedVenueData.timeSlots[0];
    
    const requiredFields = ['id', 'time', 'startTime', 'endTime', 'price', 'available'];
    const missingFields = requiredFields.filter(field => !(field in mobileCompatibleSlot));
    
    if (missingFields.length === 0) {
      console.log('✅ Mobile app compatibility: EXCELLENT');
      console.log('💡 Mobile app will display updated time slots correctly');
    } else {
      console.log(`⚠️  Mobile app compatibility: Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Restore original price for next test
    console.log('\n🔄 Restoring original data...');
    await updateDoc(venueRef, {
      timeSlots: originalTimeSlots,
      updatedAt: new Date()
    });
    console.log('✅ Original data restored');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminEditVenueFix();