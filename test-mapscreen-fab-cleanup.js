#!/usr/bin/env node

/**
 * Test MapScreen FAB Cleanup
 * 
 * This script verifies that:
 * 1. The 2nd and 3rd floating buttons (zoom-in, fullscreen) are removed
 * 2. Only location and list buttons remain
 * 3. Location button functionality is fixed
 */

const fs = require('fs');

console.log('🧹 Testing MapScreen FAB Cleanup...\n');

// Test the MapScreen file
const mapScreenPath = 'src/screens/main/MapScreen.js';
const mapScreenContent = fs.readFileSync(mapScreenPath, 'utf8');

console.log('📋 Checking FAB cleanup:');

// Test 1: Verify zoom-in button is removed
const hasZoomInButton = mapScreenContent.includes('name="zoom-in"') && 
                        mapScreenContent.includes('TouchableOpacity') &&
                        mapScreenContent.includes('fabButton');
console.log(`   ${!hasZoomInButton ? '✅' : '❌'} Zoom-in button removed: ${!hasZoomInButton ? 'Yes' : 'No'}`);

// Test 2: Verify fullscreen button is removed
const hasFullscreenButton = mapScreenContent.includes('name="fullscreen"') && 
                            mapScreenContent.includes('TouchableOpacity') &&
                            mapScreenContent.includes('fabButton');
console.log(`   ${!hasFullscreenButton ? '✅' : '❌'} Fullscreen button removed: ${!hasFullscreenButton ? 'Yes' : 'No'}`);

// Test 3: Verify location button is present
const hasLocationButton = mapScreenContent.includes('name={isLoading ? "hourglass-empty" : location ? "my-location" : "location-off"}');
console.log(`   ${hasLocationButton ? '✅' : '❌'} Location button present: ${hasLocationButton ? 'Yes' : 'No'}`);

// Test 4: Verify list button is present
const hasListButton = mapScreenContent.includes('name="view-list"') && 
                      mapScreenContent.includes('TouchableOpacity') &&
                      mapScreenContent.includes('fabButton');
console.log(`   ${hasListButton ? '✅' : '❌'} List button present: ${hasListButton ? 'Yes' : 'No'}`);

// Test 5: Verify location button uses requestLocationAccess (not conditional)
const locationButtonFixed = mapScreenContent.includes('onPress={requestLocationAccess}') &&
                            !mapScreenContent.includes('onPress={location ? getCurrentLocation : requestLocationAccess}');
console.log(`   ${locationButtonFixed ? '✅' : '❌'} Location button functionality fixed: ${locationButtonFixed ? 'Yes' : 'No'}`);

// Test 6: Verify requestLocationAccess function exists
const hasRequestLocationAccess = mapScreenContent.includes('const requestLocationAccess = async () => {');
console.log(`   ${hasRequestLocationAccess ? '✅' : '❌'} requestLocationAccess function exists: ${hasRequestLocationAccess ? 'Yes' : 'No'}`);

// Test 7: Verify only 2 TouchableOpacity buttons in FAB container
const fabTouchableOpacityCount = (mapScreenContent.match(/TouchableOpacity[^>]*style=\[[^\]]*fabButton/g) || []).length;
console.log(`   ${fabTouchableOpacityCount === 2 ? '✅' : '❌'} Only 2 FAB buttons remain (${fabTouchableOpacityCount}/2): ${fabTouchableOpacityCount === 2 ? 'Yes' : 'No'}`);

// Test 8: Verify unused styles are cleaned up
const hasUnusedZoomFabStyle = mapScreenContent.includes('zoomFab: {');
console.log(`   ${!hasUnusedZoomFabStyle ? '✅' : '❌'} Unused zoomFab style removed: ${!hasUnusedZoomFabStyle ? 'Yes' : 'No'}`);

// Test 9: Verify brand colors are maintained
const usesBrandColors = mapScreenContent.includes('backgroundColor: themeColors.colors.primary') &&
                        mapScreenContent.includes('color={themeColors.colors.secondary}');
console.log(`   ${usesBrandColors ? '✅' : '❌'} Brand colors maintained: ${usesBrandColors ? 'Yes' : 'No'}`);

// Calculate score
const tests = [
  !hasZoomInButton,
  !hasFullscreenButton,
  hasLocationButton,
  hasListButton,
  locationButtonFixed,
  hasRequestLocationAccess,
  fabTouchableOpacityCount === 2,
  !hasUnusedZoomFabStyle,
  usesBrandColors
];

const passedTests = tests.filter(test => test).length;
const totalTests = tests.length;

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('\n🎉 All Tests Passed!');
  console.log('\n✨ FAB Cleanup Summary:');
  console.log('   • Removed zoom-in button (2nd button)');
  console.log('   • Removed fullscreen button (3rd button)');
  console.log('   • Fixed location button functionality');
  console.log('   • Kept location and list buttons only');
  console.log('   • Maintained brand colors');
  console.log('   • Cleaned up unused styles');
  
  console.log('\n🚀 Remaining FAB Buttons:');
  console.log('   1. 📍 Location Button (Top)');
  console.log('      - Icon: location-off/my-location/hourglass-empty');
  console.log('      - Function: Request location access');
  console.log('      - Color: Primary background, secondary icon');
  console.log('');
  console.log('   2. 📋 List Button (Bottom)');
  console.log('      - Icon: view-list');
  console.log('      - Function: Navigate to venue list');
  console.log('      - Color: Primary background, secondary icon');
  
  console.log('\n📱 Expected Behavior:');
  console.log('   • Location button: Always requests location access');
  console.log('   • Shows permission dialog if needed');
  console.log('   • Gets current location if permission granted');
  console.log('   • Updates map and fetches nearby venues');
  console.log('   • List button: Opens venue list screen');
  
  console.log('\n🧪 Test in App:');
  console.log('   1. Open mobile app');
  console.log('   2. Navigate to Map screen');
  console.log('   3. Verify only 2 FAB buttons on right side');
  console.log('   4. Test location button functionality');
  console.log('   5. Test list button navigation');
  
} else {
  console.log('\n❌ Some Tests Failed!');
  console.log('   Please review the implementation and fix any issues.');
  
  if (hasZoomInButton) {
    console.log('   - Zoom-in button not properly removed');
  }
  if (hasFullscreenButton) {
    console.log('   - Fullscreen button not properly removed');
  }
  if (!hasLocationButton) {
    console.log('   - Location button missing');
  }
  if (!hasListButton) {
    console.log('   - List button missing');
  }
  if (!locationButtonFixed) {
    console.log('   - Location button functionality not fixed');
  }
  if (!hasRequestLocationAccess) {
    console.log('   - requestLocationAccess function missing');
  }
  if (fabTouchableOpacityCount !== 2) {
    console.log('   - Incorrect number of FAB buttons');
  }
  if (hasUnusedZoomFabStyle) {
    console.log('   - Unused zoomFab style not removed');
  }
  if (!usesBrandColors) {
    console.log('   - Brand colors not maintained');
  }
}

console.log('\n' + '='.repeat(50));