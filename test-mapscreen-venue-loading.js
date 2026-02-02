// Test MapScreen venue loading specifically
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config (using the same config as the app)
const firebaseConfig = {
  apiKey: "AIzaSyA7G3uLmKNCDhiyTuwK6GBbTxRJFvmGNpY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.firebasestorage.app",
  messagingSenderId: "960416327217",
  appId: "1:960416327217:android:bc3d63f865bef8be8f5710"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testMapScreenVenueLoading() {
  console.log('🧪 Testing MapScreen Venue Loading...\n');
  
  try {
    // Test 1: Check if venues exist in database
    console.log('1. 📊 Checking venues in database...');
    const venuesRef = collection(db, 'venues');
    const activeVenuesQuery = query(venuesRef, where('isActive', '==', true));
    const snapshot = await getDocs(activeVenuesQuery);
    
    console.log(`   ✅ Found ${snapshot.size} active venues in database`);
    
    if (snapshot.size === 0) {
      console.log('   ❌ No active venues found - this is the problem!');
      return;
    }
    
    // Test 2: Check venue coordinate structure
    console.log('\n2. 📍 Checking venue coordinates...');
    const venues = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      venues.push({
        id: doc.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        location: data.location,
        isActive: data.isActive
      });
    });
    
    console.log('   Venue coordinate analysis:');
    venues.forEach((venue, index) => {
      console.log(`   ${index + 1}. ${venue.name}:`);
      console.log(`      Direct coords: lat=${venue.latitude}, lng=${venue.longitude}`);
      console.log(`      Location object: ${JSON.stringify(venue.location)}`);
      
      // Check coordinate validity
      const hasDirectCoords = venue.latitude && venue.longitude && 
        typeof venue.latitude === 'number' && typeof venue.longitude === 'number' &&
        venue.latitude >= -90 && venue.latitude <= 90 &&
        venue.longitude >= -180 && venue.longitude <= 180 &&
        !(venue.latitude === 0 && venue.longitude === 0);
        
      const hasLocationCoords = venue.location && 
        venue.location.latitude && venue.location.longitude &&
        typeof venue.location.latitude === 'number' && typeof venue.location.longitude === 'number' &&
        venue.location.latitude >= -90 && venue.location.latitude <= 90 &&
        venue.location.longitude >= -180 && venue.location.longitude <= 180 &&
        !(venue.location.latitude === 0 && venue.location.longitude === 0);
      
      console.log(`      Valid direct coords: ${hasDirectCoords ? '✅' : '❌'}`);
      console.log(`      Valid location coords: ${hasLocationCoords ? '✅' : '❌'}`);
      console.log(`      Can be displayed: ${hasDirectCoords || hasLocationCoords ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Test 3: Simulate MapScreen coordinate processing
    console.log('3. 🗺️ Simulating MapScreen coordinate processing...');
    
    const processedVenues = venues.map(venue => {
      // This mimics the getVenueCoordinatesSync function from MapScreen
      let coordinates = null;
      
      // Priority 1: Direct coordinates
      if (venue.latitude && venue.longitude &&
          typeof venue.latitude === 'number' && typeof venue.longitude === 'number' &&
          venue.latitude >= -90 && venue.latitude <= 90 &&
          venue.longitude >= -180 && venue.longitude <= 180 &&
          !(venue.latitude === 0 && venue.longitude === 0)) {
        coordinates = {
          latitude: venue.latitude,
          longitude: venue.longitude,
          isValid: true,
          source: 'direct'
        };
      }
      // Priority 2: Location object coordinates
      else if (venue.location && venue.location.latitude && venue.location.longitude &&
               typeof venue.location.latitude === 'number' && typeof venue.location.longitude === 'number' &&
               venue.location.latitude >= -90 && venue.location.latitude <= 90 &&
               venue.location.longitude >= -180 && venue.location.longitude <= 180 &&
               !(venue.location.latitude === 0 && venue.location.longitude === 0)) {
        coordinates = {
          latitude: venue.location.latitude,
          longitude: venue.location.longitude,
          isValid: true,
          source: 'location'
        };
      }
      // No valid coordinates
      else {
        coordinates = {
          latitude: null,
          longitude: null,
          isValid: false,
          source: 'none'
        };
      }
      
      return {
        ...venue,
        coordinates
      };
    });
    
    const validVenues = processedVenues.filter(v => v.coordinates.isValid);
    const invalidVenues = processedVenues.filter(v => !v.coordinates.isValid);
    
    console.log(`   ✅ ${validVenues.length}/${venues.length} venues have valid coordinates`);
    console.log(`   ❌ ${invalidVenues.length} venues have invalid coordinates`);
    
    if (validVenues.length === 0) {
      console.log('\n   🚨 PROBLEM FOUND: No venues have valid coordinates!');
      console.log('   This is why venues are not showing on MapScreen.');
      console.log('\n   📋 Venues with invalid coordinates:');
      invalidVenues.forEach(venue => {
        console.log(`   - ${venue.name}: ${venue.coordinates.source === 'none' ? 'No valid coordinates found' : 'Coordinates failed validation'}`);
      });
    } else {
      console.log('\n   ✅ Valid venues that should appear on map:');
      validVenues.forEach(venue => {
        console.log(`   - ${venue.name}: ${venue.coordinates.latitude}, ${venue.coordinates.longitude} (${venue.coordinates.source})`);
      });
    }
    
    // Test 4: Check if coordinates are in reasonable geographic area
    console.log('\n4. 🌍 Checking if coordinates are in reasonable area...');
    validVenues.forEach(venue => {
      const { latitude, longitude } = venue.coordinates;
      
      // Check if coordinates are in Pakistan/reasonable area
      const inPakistan = latitude >= 23.5 && latitude <= 37.5 && longitude >= 60.5 && longitude <= 77.5;
      const inLahore = latitude >= 31.0 && latitude <= 32.0 && longitude >= 74.0 && longitude <= 75.0;
      const inKarachi = latitude >= 24.5 && latitude <= 25.5 && longitude >= 66.5 && longitude <= 68.0;
      
      console.log(`   ${venue.name}:`);
      console.log(`     Coordinates: ${latitude}, ${longitude}`);
      console.log(`     In Pakistan: ${inPakistan ? '✅' : '❌'}`);
      console.log(`     In Lahore: ${inLahore ? '✅' : '❌'}`);
      console.log(`     In Karachi: ${inKarachi ? '✅' : '❌'}`);
    });
    
    // Test 5: Generate recommendations
    console.log('\n5. 💡 Recommendations:');
    
    if (validVenues.length === 0) {
      console.log('   🔧 CRITICAL: Fix venue coordinates in Firebase');
      console.log('   - Update venues with valid latitude/longitude values');
      console.log('   - Ensure coordinates are in Pakistan (lat: 23.5-37.5, lng: 60.5-77.5)');
      console.log('   - Use Google Maps to get accurate coordinates');
    } else if (validVenues.length < venues.length) {
      console.log('   ⚠️ Some venues need coordinate fixes');
      console.log('   - Update invalid venues with proper coordinates');
    } else {
      console.log('   ✅ All venues have valid coordinates');
      console.log('   - Issue might be in MapScreen rendering or API calls');
      console.log('   - Check browser console for JavaScript errors');
      console.log('   - Verify Redux store is receiving venue data');
      console.log('   - Check if location permissions are granted');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. If coordinates are invalid: Update venue data in Firebase');
    console.log('2. If coordinates are valid: Check MapScreen console for errors');
    console.log('3. Verify fetchNearbyTurfs is being called successfully');
    console.log('4. Check Redux DevTools for venue data in store');
    
  } catch (error) {
    console.error('❌ Error testing venue loading:', error);
  }
}

// Run the test
testMapScreenVenueLoading().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});