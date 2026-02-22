const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Platform ReferenceError...\n');

// Files that use Platform
const filesToCheck = [
  'src/screens/turf/TurfDetailScreen.js',
  'src/screens/team/ChallengeScreen.js',
  'src/screens/profile/PasswordSecurityScreen.js',
  'src/screens/profile/ProfileScreen.js',
  'src/screens/profile/NotificationScreen.js',
  'src/screens/team/ChallengeScreenRedesigned.js',
  'src/screens/main/HomeScreen.js',
  'src/screens/main/FavoritesScreen.js',
  'src/screens/main/MapScreen.js',
  'src/screens/location/LocationPermissionScreen.js',
  'src/screens/main/VenueListScreen.js',
  'src/screens/location/ManualLocationScreen.js',
  'src/screens/auth/SignUpScreen.js',
  'src/screens/auth/SignInScreen.js',
  'src/screens/auth/ForgotPasswordScreen.js',
  'src/screens/booking/BookingConfirmScreen.js',
  'src/components/FilterModal.js',
  'src/components/CustomTabBar.js',
  'src/components/GlassCard.js'
];

let issuesFound = 0;

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if file uses Platform
    const usesPlatform = content.includes('Platform.');
    
    if (usesPlatform) {
      // Check if Platform is imported
      const hasPlatformImport = /import\s+{[^}]*Platform[^}]*}\s+from\s+['"]react-native['"]/.test(content);
      
      if (!hasPlatformImport) {
        console.log(`❌ ${file}`);
        console.log('   Uses Platform but does NOT import it!\n');
        issuesFound++;
      } else {
        console.log(`✅ ${file}`);
        console.log('   Uses Platform and imports it correctly\n');
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not read ${file}: ${error.message}\n`);
  }
});

console.log('\n' + '='.repeat(60));
if (issuesFound === 0) {
  console.log('✅ All files that use Platform have it properly imported');
  console.log('\nThe error might be:');
  console.log('1. In a dynamically loaded component');
  console.log('2. In a callback where Platform is out of scope');
  console.log('3. In a file that was recently modified');
  console.log('\nTry:');
  console.log('- Clear Metro bundler cache: npx expo start -c');
  console.log('- Check the error stack trace for the exact file');
} else {
  console.log(`❌ Found ${issuesFound} file(s) with missing Platform import`);
}
console.log('='.repeat(60));
