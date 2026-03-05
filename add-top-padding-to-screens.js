/**
 * Script to add top padding to all screens
 * This ensures consistent spacing from the status bar across all screens
 */

const fs = require('fs');
const path = require('path');

// Standard top padding value
const TOP_PADDING = 16;

// List of screen files to update
const screenFiles = [
  'src/screens/main/HomeScreen.js',
  'src/screens/main/MapScreen.js',
  'src/screens/main/FavoritesScreen.js',
  'src/screens/main/VenueListScreen.js',
  'src/screens/main/SquadBuilderScreen.js',
  'src/screens/turf/TurfDetailScreen.js',
  'src/screens/booking/BookingScreen.js',
  'src/screens/booking/BookingConfirmScreen.js',
  'src/screens/booking/EReceiptScreen.js',
  'src/screens/profile/ProfileScreen.js',
  'src/screens/profile/NotificationScreen.js',
  'src/screens/profile/ManageProfileScreen.js',
  'src/screens/team/ChallengeScreen.js',
  'src/screens/auth/SignInScreen.js',
  'src/screens/auth/SignUpScreen.js',
  'src/screens/location/LocationPermissionScreen.js',
  'src/screens/location/ManualLocationScreen.js',
];

function addTopPaddingToScreen(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already has paddingTop in container style
    if (content.includes('container:') && content.match(/container:\s*\{[^}]*paddingTop/)) {
      console.log(`✓ ${filePath} - Already has paddingTop`);
      return;
    }
    
    // Find container style and add paddingTop
    const containerStyleRegex = /(container:\s*\{[^}]*)(flex:\s*1,?)/;
    
    if (containerStyleRegex.test(content)) {
      content = content.replace(
        containerStyleRegex,
        `$1$2\n    paddingTop: ${TOP_PADDING},`
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath} - Added paddingTop: ${TOP_PADDING}`);
    } else {
      console.log(`⚠️  ${filePath} - No container style found with flex: 1`);
    }
  } catch (error) {
    console.error(`❌ ${filePath} - Error:`, error.message);
  }
}

console.log('🚀 Adding top padding to all screens...\n');

screenFiles.forEach(file => {
  if (fs.existsSync(file)) {
    addTopPaddingToScreen(file);
  } else {
    console.log(`⚠️  ${file} - File not found`);
  }
});

console.log('\n✅ Top padding update complete!');
