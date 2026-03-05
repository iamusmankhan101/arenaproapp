import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

console.log('🔍 Debugging Time Slots Sync Issue...');

async function debugTimeSlots() {
  try {
    // Get all venues
    console.log('📋 Fetching all venues from database...');
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    
    if (snapshot.empty) {
      console.log('❌ No venues found in database');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} venues in database\n`);
    
    // Check each venue's time slots
    for (const venueDoc of snapshot.docs) {
      const venueData = venueDoc.data();
      const venueId = venueDoc.id;
      
      console.log(`🏟️ VENUE: ${venueData.name} (ID: ${venueId})`);
      console.log(`   📍 Location: ${venueData.area || 'N/A'}, ${venueData.city || 'N/A'}`);
      console.log(`   💰 Base Price: PKR ${venueData.pricing?.basePrice || venueData.basePrice || 'N/A'}`);
      console.log(`   🕐 Operating Hours: ${venueData.operatingHours?.open || 'N/A'} - ${venueData.operatingHours?.close || 'N/A'}`);
      
      // Check time slots
      const timeSlots = venueData.timeSlots || [];
      console.log(`   📅 Time Slots: ${timeSlots.length} configured`);
      
      if (timeSlots.length === 0) {
        console.log('   ⚠️  NO TIME SLOTS FOUND - This explains why they don\'t show in the app!');
      } else {
        console.log('   📋 Sample time slots:');
        timeSlots.slice(0, 3).forEach((slot, index) => {
          console.log(`      ${index + 1}. ${slot.time || slot.startTime} - ${slot.endTime}: PKR ${slot.price} (Available: ${slot.available !== false})`);
        });
        if (timeSlots.length > 3) {
          console.log(`      ... and ${timeSlots.length - 3} more slots`);
        }
      }
      
      // Check if venue has the fields mobile app expects
      const expectedFields = ['name', 'sports', 'pricing', 'operatingHours', 'isActive'];
      const missingFields = expectedFields.filter(field => !venueData[field]);
      if (missingFields.length > 0) {
        console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test the mobile app's API call
    console.log('🧪 Testing mobile app\'s venue fetch...');
    const testVenue = snapshot.docs[0];
    const testVenueId = testVenue.id;
    const testVenueData = testVenue.data();
    
    console.log(`📱 Simulating mobile app call for venue: ${testVenueData.name}`);
    
    // This simulates what the mobile app does
    const venueRef = doc(db, 'venues', testVenueId);
    const venueSnap = await getDoc(venueRef);
    
    if (venueSnap.exists()) {
      const mobileVenueData = venueSnap.data();
      const mobileTimeSlots = mobileVenueData.timeSlots || [];
      
      console.log(`✅ Mobile app would receive ${mobileTimeSlots.length} time slots`);
      
      if (mobileTimeSlots.length === 0) {
        console.log('❌ PROBLEM IDENTIFIED: Mobile app receives 0 time slots!');
        console.log('💡 This means the time slots you added aren\'t being saved properly.');
      } else {
        console.log('✅ Time slots are properly stored and should show in mobile app');
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging time slots:', error);
  }
}

debugTimeSlots();