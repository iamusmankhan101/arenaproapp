/**
 * Mapbox Migration Test Script
 * 
 * This script verifies that the Mapbox migration was successful
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️  Testing Mapbox Migration...\n');

// Test 1: Check if Mapbox package is installed
console.log('1️⃣  Checking Mapbox package installation...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies['@rnmapbox/maps']) {
    console.log('   ✅ @rnmapbox/maps is installed\n');
  } else {
    console.log('   ❌ @rnmapbox/maps is NOT installed\n');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json\n');
}

// Test 2: Check app.json configuration
console.log('2️⃣  Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const hasMapboxPlugin = appJson.expo.plugins.includes('@rnmapbox/maps');
  if (hasMapboxPlugin) {
    console.log('   ✅ Mapbox plugin configured in app.json\n');
  } else {
    console.log('   ❌ Mapbox plugin NOT found in app.json\n');
  }
} catch (error) {
  console.log('   ❌ Error reading app.json\n');
}

// Test 3: Check MapScreen imports
console.log('3️⃣  Checking MapScreen imports...');
try {
  const mapScreenPath = path.join('src', 'screens', 'main', 'MapScreen.js');
  const mapScreenContent = fs.readFileSync(mapScreenPath, 'utf8');
  
  const hasMapboxImport = mapScreenContent.includes("import Mapbox from '@rnmapbox/maps'");
  const hasGoogleMapsImport = mapScreenContent.includes("import MapView") && 
                               mapScreenContent.includes("react-native-maps") &&
                               !mapScreenContent.includes("// import MapView");
  
  if (hasMapboxImport && !hasGoogleMapsImport) {
    console.log('   ✅ MapScreen uses Mapbox imports\n');
  } else if (hasMapboxImport && hasGoogleMapsImport) {
    console.log('   ⚠️  MapScreen has both Mapbox and Google Maps imports\n');
  } else {
    console.log('   ❌ MapScreen still uses Google Maps\n');
  }
} catch (error) {
  console.log('   ❌ Error reading MapScreen.js\n');
}

// Test 4: Check for Mapbox.MapView usage
console.log('4️⃣  Checking Mapbox.MapView usage...');
try {
  const mapScreenPath = path.join('src', 'screens', 'main', 'MapScreen.js');
  const mapScreenContent = fs.readFileSync(mapScreenPath, 'utf8');
  
  const hasMapboxMapView = mapScreenContent.includes('Mapbox.MapView');
  const hasMapboxCamera = mapScreenContent.includes('Mapbox.Camera');
  const hasMapboxPointAnnotation = mapScreenContent.includes('Mapbox.PointAnnotation');
  
  if (hasMapboxMapView && hasMapboxCamera && hasMapboxPointAnnotation) {
    console.log('   ✅ MapScreen uses Mapbox components\n');
  } else {
    console.log('   ❌ MapScreen missing Mapbox components\n');
    if (!hasMapboxMapView) console.log('      - Missing Mapbox.MapView');
    if (!hasMapboxCamera) console.log('      - Missing Mapbox.Camera');
    if (!hasMapboxPointAnnotation) console.log('      - Missing Mapbox.PointAnnotation');
    console.log('');
  }
} catch (error) {
  console.log('   ❌ Error reading MapScreen.js\n');
}

// Test 5: Check for backup file
console.log('5️⃣  Checking backup file...');
try {
  const backupPath = path.join('src', 'screens', 'main', 'MapScreen.GoogleMaps.backup.js');
  if (fs.existsSync(backupPath)) {
    console.log('   ✅ Google Maps backup file exists\n');
  } else {
    console.log('   ⚠️  No backup file found (optional)\n');
  }
} catch (error) {
  console.log('   ❌ Error checking backup file\n');
}

// Test 6: Check for coordinate order (lng, lat)
console.log('6️⃣  Checking coordinate format...');
try {
  const mapScreenPath = path.join('src', 'screens', 'main', 'MapScreen.js');
  const mapScreenContent = fs.readFileSync(mapScreenPath, 'utf8');
  
  // Look for [longitude, latitude] pattern
  const hasCorrectCoordinateOrder = mapScreenContent.includes('[location.longitude, location.latitude]') ||
                                     mapScreenContent.includes('[lng, lat]');
  
  if (hasCorrectCoordinateOrder) {
    console.log('   ✅ Coordinates use Mapbox format [lng, lat]\n');
  } else {
    console.log('   ⚠️  Could not verify coordinate format\n');
  }
} catch (error) {
  console.log('   ❌ Error checking coordinate format\n');
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Migration Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ = Passed');
console.log('⚠️  = Warning (check manually)');
console.log('❌ = Failed (needs attention)\n');

console.log('Next Steps:');
console.log('1. Run: npx expo start');
console.log('2. Test MapScreen in Expo Go');
console.log('3. If working, rebuild APK: eas build --profile preview --platform android\n');

console.log('🎉 Migration test complete!\n');
