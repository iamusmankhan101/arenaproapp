// Comprehensive diagnostic script for venue sync issues
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, onSnapshot } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKCwem9qZWN0cy9hcmVuYS1wcm8tOTdiNWY",
  authDomain: "arena-pro-97b5f.firebaseapp.com",
  projectId: "arena-pro-97b5f",
  storageBucket: "arena-pro-97b5f.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

async function diagnoseVenueSync() {
  try {
    console.log('🔍 COMPREHENSIVE VENUE SYNC DIAGNOSIS');
    console.log('=====================================\n');
    
    // Test 1: Firebase Connection
    console.log('📊 Test 1: Firebase Connection...');
    const turfsRef = collection(db, 'turfs');
    const testSnapshot = await getDocs(turfsRef);
    console.log(`✅ Firebase connected successfully`);
    console.log(`   Total documents in turfs collection: ${testSnapshot.size}\n`);
    
    // Test 2: Active Venues Query (what mobile app uses)
    console.log('📊 Test 2: Active Venues Query...');
    const activeQuery = query(turfsRef, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    console.log(`✅ Active venues query successful`);
    console.log(`   Active venues found: ${activeSnapshot.size}\n`);
    
    // Test 3: Venue Data Structure Analysis
    console.log('📊 Test 3: Venue Data Structure Analysis...');
    const venues = [];
    activeSnapshot.forEach((doc) => {
      const data = doc.data();
      venues.push({
        id: doc.id,
        name: data.name,
        location: data.location,
        sports: data.sports,
        pricing: data.pricing,
        isActive: data.isActive,
        createdAt: data.createdAt
      });
    });
    
    venues.forEach((venue, index) => {
      console.log(`\n🏟️ Venue ${index + 1}: ${venue.name}`);
      console.log(`   ID: ${venue.id}`);
      console.log(`   Location: ${venue.location?.latitude || 'N/A'}, ${venue.location?.longitude || 'N/A'}`);
      console.log(`   Sports: ${venue.sports?.join(', ') || 'N/A'}`);
      console.log(`   Base Price: ${venue.pricing?.basePrice || 'N/A'}`);
      console.log(`   Active: ${venue.isActive}`);
      console.log(`   Created: ${venue.createdAt ? 'Yes' : 'No'}`);
    });
    
    // Test 4: Distance Calculation (mobile app logic)
    console.log('\n📊 Test 4: Distance Calculation Test...');
    const userLat = 31.5204; // Lahore coordinates (default in HomeScreen)
    const userLng = 74.3587;
    const radius = 10; // km
    
    console.log(`   User location: ${userLat}, ${userLng}`);
    console.log(`   Search radius: ${radius} km`);
    
    const nearbyVenues = venues.filter(venue => {
      if (!venue.location?.latitude || !venue.location?.longitude) {
        console.log(`   ⚠️  ${venue.name}: No location data`);
        return false;
      }
      
      const distance = calculateDistance(
        userLat, userLng,
        venue.location.latitude, venue.location.longitude
      );
      
      console.log(`   📍 ${venue.name}: ${distance.toFixed(2)} km away`);
      return distance <= radius;
    });
    
    console.log(`\n   Venues within ${radius}km: ${nearbyVenues.length}`);
    
    // Test 5: Real-time Listener Test
    console.log('\n📊 Test 5: Real-time Listener Test...');
    console.log('   Setting up real-time listener...');
    
    let listenerCount = 0;
    const unsubscribe = onSnapshot(activeQuery, (snapshot) => {
      listenerCount++;
      console.log(`   📡 Real-time update #${listenerCount}: ${snapshot.size} venues`);
      
      if (listenerCount === 1) {
        console.log('   ✅ Real-time listener working correctly');
        
        // Test 6: Mobile App Compatibility Check
        console.log('\n📊 Test 6: Mobile App Compatibility Check...');
        
        const mobileCompatibleVenues = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Check if venue has all required fields for mobile app
          const hasRequiredFields = 
            data.name &&
            data.location?.latitude &&
            data.location?.longitude &&
            data.sports &&
            data.pricing?.basePrice &&
            data.isActive === true;
          
          if (hasRequiredFields) {
            mobileCompatibleVenues.push({
              id: doc.id,
              name: data.name,
              sport: data.sports?.[0] || 'Unknown',
              pricePerHour: data.pricing?.basePrice || 0,
              distance: calculateDistance(
                userLat, userLng,
                data.location.latitude, data.location.longitude
              ).toFixed(1) + ' km',
              time: `${data.operatingHours?.open || '6:00'} to ${data.operatingHours?.close || '23:00'} (All Days)`
            });
          }
        });
        
        console.log(`   Mobile-compatible venues: ${mobileCompatibleVenues.length}`);
        
        mobileCompatibleVenues.forEach((venue, index) => {
          console.log(`\n   📱 Mobile Venue ${index + 1}:`);
          console.log(`      Name: ${venue.name}`);
          console.log(`      Sport: ${venue.sport}`);
          console.log(`      Price: PKR ${venue.pricePerHour}/hour`);
          console.log(`      Distance: ${venue.distance}`);
          console.log(`      Hours: ${venue.time}`);
        });
        
        // Summary
        console.log('\n🎯 DIAGNOSIS SUMMARY:');
        console.log('====================');
        console.log(`✅ Firebase connection: Working`);
        console.log(`✅ Total venues in database: ${testSnapshot.size}`);
        console.log(`✅ Active venues: ${activeSnapshot.size}`);
        console.log(`✅ Venues within ${radius}km: ${nearbyVenues.length}`);
        console.log(`✅ Mobile-compatible venues: ${mobileCompatibleVenues.length}`);
        console.log(`✅ Real-time sync: Working`);
        
        if (mobileCompatibleVenues.length === 0) {
          console.log('\n❌ ISSUE FOUND: No mobile-compatible venues');
          console.log('   Possible causes:');
          console.log('   - Venues missing required fields');
          console.log('   - Venues too far from default location');
          console.log('   - Venues marked as inactive');
        } else {
          console.log('\n✅ VENUES SHOULD BE VISIBLE IN MOBILE APP');
          console.log('   If not showing, check:');
          console.log('   - Real-time sync initialization in App.js');
          console.log('   - HomeScreen useEffect for fetchNearbyTurfs');
          console.log('   - Redux store state in mobile app');
        }
        
        // Cleanup
        unsubscribe();
        process.exit(0);
      }
    }, (error) => {
      console.error('   ❌ Real-time listener error:', error);
      process.exit(1);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('   ⏰ Timeout: Real-time listener test taking too long');
      unsubscribe();
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  }
}

// Run the diagnosis
diagnoseVenueSync();