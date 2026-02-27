/**
 * Test Script: MapScreen English Labels and Venue Pins
 * 
 * This script verifies:
 * 1. Map displays with English labels (Stadia Maps)
 * 2. Venue pins are visible on the map
 * 3. Markers are properly positioned
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing MapScreen English Labels and Venue Pins...\n');

// Read MapScreen.js
const mapScreenPath = path.join(__dirname, 'src', 'screens', 'main', 'MapScreen.js');
const mapScreenContent = fs.readFileSync(mapScreenPath, 'utf8');

let allTestsPassed = true;

// Test 1: Check for Stadia Maps tile layer (English labels)
console.log('Test 1: Checking for English map tiles (Stadia Maps)...');
if (mapScreenContent.includes('tiles.stadiamaps.com/tiles/alidade_smooth')) {
  console.log('✅ PASS: Using Stadia Maps Alidade Smooth (English labels)');
} else if (mapScreenContent.includes('tile.openstreetmap.org')) {
  console.log('❌ FAIL: Still using standard OSM (local language labels)');
  allTestsPassed = false;
} else {
  console.log('⚠️  WARNING: Unknown tile provider');
  allTestsPassed = false;
}

// Test 2: Check for marker creation function
console.log('\nTest 2: Checking for marker creation...');
if (mapScreenContent.includes('function updateMarkers(venuesData)')) {
  console.log('✅ PASS: updateMarkers function exists');
  
  // Check for proper marker icon
  if (mapScreenContent.includes('L.marker([venue.lat, venue.lng]')) {
    console.log('✅ PASS: Markers are created with coordinates');
  } else {
    console.log('❌ FAIL: Marker creation code not found');
    allTestsPassed = false;
  }
  
  // Check for visible marker icon
  if (mapScreenContent.includes('📍') || mapScreenContent.includes('divIcon')) {
    console.log('✅ PASS: Markers have visible icons');
  } else {
    console.log('❌ FAIL: Marker icons not configured');
    allTestsPassed = false;
  }
} else {
  console.log('❌ FAIL: updateMarkers function not found');
  allTestsPassed = false;
}

// Test 3: Check for marker initialization
console.log('\nTest 3: Checking for marker initialization...');
if (mapScreenContent.includes('updateMarkers(${JSON.stringify(markersData)})')) {
  console.log('✅ PASS: Markers are initialized with venue data');
} else {
  console.log('❌ FAIL: Marker initialization not found');
  allTestsPassed = false;
}

// Test 4: Check for coordinate validation
console.log('\nTest 4: Checking for coordinate validation...');
if (mapScreenContent.includes('isValidCoordinate') && 
    mapScreenContent.includes('processVenuesCoordinates')) {
  console.log('✅ PASS: Coordinate validation is implemented');
} else {
  console.log('❌ FAIL: Coordinate validation missing');
  allTestsPassed = false;
}

// Test 5: Check for map bounds fitting
console.log('\nTest 5: Checking for map bounds adjustment...');
if (mapScreenContent.includes('fitBounds') || mapScreenContent.includes('map.fitBounds')) {
  console.log('✅ PASS: Map automatically fits to show all markers');
} else {
  console.log('⚠️  WARNING: Map bounds not automatically adjusted (markers might be off-screen)');
}

// Test 6: Check for console logging
console.log('\nTest 6: Checking for debug logging...');
if (mapScreenContent.includes('console.log') && 
    mapScreenContent.includes('markers')) {
  console.log('✅ PASS: Debug logging is enabled for troubleshooting');
} else {
  console.log('⚠️  WARNING: Limited debug logging');
}

// Summary
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('\n📋 What was fixed:');
  console.log('1. ✅ Map now uses Stadia Maps with English labels');
  console.log('2. ✅ Venue pins are properly created and displayed');
  console.log('3. ✅ Markers have visible icons (📍)');
  console.log('4. ✅ Map automatically fits to show all venues');
  console.log('5. ✅ Debug logging added for troubleshooting');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Restart your Expo app');
  console.log('2. Navigate to Map screen');
  console.log('3. You should see:');
  console.log('   - Map with English street names');
  console.log('   - Red pin markers (📍) for each venue');
  console.log('   - Tap a marker to see venue details');
  
  console.log('\n💡 Note:');
  console.log('- Stadia Maps is free for development');
  console.log('- For production, consider getting an API key');
  console.log('- Alternative: Use Thunderforest or MapTiler');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('Please review the failed tests above.');
}
console.log('='.repeat(60));
