// Debug script to identify why venues are not showing on MapScreen
const { execSync } = require('child_process');

console.log('🔍 Debugging MapScreen Venues Issue...\n');

// Test Firebase connection and venue data
const testFirebaseVenues = `
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase config (using your existing config)
const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugVenues() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test 1: Get all venues
    const venuesRef = collection(db, 'venues');
    const allVenuesSnapshot = await getDocs(venuesRef);
    console.log(\`📊 Total venues in database: \${allVenuesSnapshot.size}\`);
    
    // Test 2: Get active venues only
    const activeVenuesQuery = query(venuesRef, where('isActive', '==', true));
    const activeVenuesSnapshot = await getDocs(activeVenuesQuery);
    console.log(\`✅ Active venues: \${activeVenuesSnapshot.size}\`);
    
    // Test 3: Check venue data structure
    if (activeVenuesSnapshot.size > 0) {
      console.log('\\n📍 Sample venue data:');
      const firstVenue = activeVenuesSnapshot.docs[0];
      const venueData = firstVenue.data();
      console.log(\`ID: \${firstVenue.id}\`);
      console.log(\`Name: \${venueData.name}\`);
      console.log(\`Coordinates: \${venueData.latitude}, \${venueData.longitude}\`);
      console.log(\`Location object: \${JSON.stringify(venueData.location)}\`);
      console.log(\`Is Active: \${venueData.isActive}\`);
    }
    
    return activeVenuesSnapshot.size;
  } catch (error) {
    console.error('❌ Firebase error:', error);
    return 0;
  }
}

debugVenues().then(count => {
  console.log(\`\\n🎯 Result: \${count} active venues found\`);
  process.exit(0);
});
`;

console.log('🧪 Running Firebase venue check...');
require('fs').writeFileSync('temp-firebase-test.js', testFirebaseVenues);

try {
  // Check if venues exist in database
  console.log('📊 Checking venue data in Firebase...');
  
  // Alternative: Check using existing script
  execSync('node check-venues-collection.js', { stdio: 'inherit', timeout: 10000 });
  
} catch (error) {
  console.log('⚠️ Could not run venue check, continuing with other tests...');
}

console.log('\n🔍 Potential Issues to Check:\n');

console.log('1. 📡 API/Network Issues:');
console.log('   - Check if fetchNearbyTurfs is being called');
console.log('   - Verify Firebase connection in mobile app');
console.log('   - Check network connectivity');

console.log('\n2. 🗺️ Coordinate Issues:');
console.log('   - Venues might have invalid coordinates');
console.log('   - Coordinate validation might be too strict');
console.log('   - Location permission might be denied');

console.log('\n3. 🔄 State Management Issues:');
console.log('   - Redux store might not be updating');
console.log('   - nearbyTurfs might be empty');
console.log('   - filteredVenues might be filtered out');

console.log('\n4. 🎯 Rendering Issues:');
console.log('   - Map might not be ready');
console.log('   - Markers might be rendered outside visible area');
console.log('   - Styling issues hiding markers');

console.log('\n🛠️ Debugging Steps:');
console.log('1. Check browser/app console for errors');
console.log('2. Verify Redux DevTools for venue data');
console.log('3. Check network tab for API calls');
console.log('4. Test location permissions');
console.log('5. Verify Firebase rules allow reading venues');

console.log('\n📱 Quick Fixes to Try:');
console.log('1. Restart the app completely');
console.log('2. Clear app cache/storage');
console.log('3. Check location permissions');
console.log('4. Try on different device/browser');
console.log('5. Check Firebase console for venue data');

// Clean up temp file
try {
  require('fs').unlinkSync('temp-firebase-test.js');
} catch (e) {}

console.log('\n🔧 Next Steps:');
console.log('1. Run: npm start (restart app)');
console.log('2. Open browser console and check for errors');
console.log('3. Check Redux DevTools for venue data');
console.log('4. Verify location permissions are granted');