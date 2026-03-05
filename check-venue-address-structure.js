// Check venue address structure in database
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

async function checkVenueAddressStructure() {
  try {
    console.log('🔍 Checking venue address structure in database...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all venues
    const venuesRef = collection(db, 'venues');
    const venuesSnapshot = await getDocs(venuesRef);
    
    console.log(`✅ Found ${venuesSnapshot.size} venues in database`);
    
    venuesSnapshot.forEach((doc) => {
      const venueData = doc.data();
      console.log(`\n📍 Venue: ${venueData.name || 'Unnamed'} (ID: ${doc.id})`);
      console.log('Address fields:');
      console.log(`- address: ${venueData.address || 'Not set'}`);
      console.log(`- area: ${venueData.area || 'Not set'}`);
      console.log(`- city: ${venueData.city || 'Not set'}`);
      console.log(`- latitude: ${venueData.latitude || 'Not set'}`);
      console.log(`- longitude: ${venueData.longitude || 'Not set'}`);
      
      // Check if location object exists
      if (venueData.location) {
        console.log('Location object:');
        console.log(`- location.latitude: ${venueData.location.latitude || 'Not set'}`);
        console.log(`- location.longitude: ${venueData.location.longitude || 'Not set'}`);
        console.log(`- location.address: ${venueData.location.address || 'Not set'}`);
        console.log(`- location.city: ${venueData.location.city || 'Not set'}`);
      }
      
      console.log('Full venue data:');
      console.log(JSON.stringify(venueData, null, 2));
      console.log('---');
    });
    
    console.log('\n🎯 Summary for MapScreen implementation:');
    console.log('1. Check if venues have latitude/longitude coordinates');
    console.log('2. Use address field for geocoding if coordinates are missing');
    console.log('3. Display full address in map markers and callouts');
    console.log('4. Consider implementing geocoding service for address-to-coordinates conversion');
    
  } catch (error) {
    console.error('❌ Error checking venue structure:', error);
  }
}

checkVenueAddressStructure();