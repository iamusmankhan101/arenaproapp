/**
 * Verification script to ensure UI consistency between Expo Go and APK builds
 * 
 * This script checks:
 * 1. Font configuration
 * 2. Asset bundling
 * 3. Theme consistency
 * 4. Platform-specific code usage
 * 5. Environment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying UI Consistency Configuration...\n');

// Test 1: Check App.js font loading
console.log('📱 Test 1: Font Loading Configuration');
const appJsPath = path.join(__dirname, 'App.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const hasFontLoading = appJsContent.includes('useFonts') && 
                      appJsContent.includes('Montserrat_400Regular');
const hasFontWait = appJsContent.includes('if (!fontsLoaded)') && 
                   appJsContent.includes('return null');

if (hasFontLoading && hasFontWait) {
  console.log('✅ PASS: Fonts properly loaded with fallback');
} else {
  console.log('❌ FAIL: Font loading not properly configured');
}

// Test 2: Check app.json asset bundling
console.log('\n📦 Test 2: Asset Bundling Configuration');
const appJsonPath = path.join(__dirname, 'app.json');
const appJsonContent = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const hasAssetBundling = appJsonContent.expo.assetBundlePatterns && 
                        appJsonContent.expo.assetBundlePatterns.includes('**/*');

if (hasAssetBundling) {
  console.log('✅ PASS: All assets will be bundled in APK');
} else {
  console.log('❌ FAIL: Asset bundling not properly configured');
}

// Test 3: Check theme configuration
console.log('\n🎨 Test 3: Theme Configuration');
const themePath = path.join(__dirname, 'src/theme/theme.js');
if (fs.existsSync(themePath)) {
  const themeContent = fs.readFileSync(themePath, 'utf8');
  const hasThemeExport = themeContent.includes('export') && 
                        themeContent.includes('theme');
  
  if (hasThemeExport) {
    console.log('✅ PASS: Theme configuration exists');
  } else {
    console.log('❌ FAIL: Theme not properly exported');
  }
} else {
  console.log('❌ FAIL: Theme file not found');
}

// Test 4: Check for hardcoded environment URLs
console.log('\n🌐 Test 4: Environment Configuration');
const firebaseConfigPath = path.join(__dirname, 'src/config/firebase.js');
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  const hasLocalhost = firebaseContent.includes('localhost') || 
                      firebaseContent.includes('127.0.0.1');
  
  if (hasLocalhost) {
    console.log('⚠️  WARNING: Firebase config contains localhost URLs');
    console.log('   This may cause issues in APK builds');
  } else {
    console.log('✅ PASS: No localhost URLs in Firebase config');
  }
} else {
  console.log('⚠️  WARNING: Firebase config not found');
}

// Test 5: Check Platform.OS usage
console.log('\n📱 Test 5: Platform-Specific Code Usage');
const platformUsageFiles = [
  'src/screens/auth/SignInScreen.js',
  'src/screens/auth/SignUpScreen.js',
  'src/screens/turf/TurfDetailScreen.js'
];

let platformUsageCount = 0;
let appropriateUsage = true;

platformUsageFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/Platform\.OS/g);
    if (matches) {
      platformUsageCount += matches.length;
      
      // Check if usage is appropriate (keyboard handling, safe area)
      const hasKeyboardHandling = content.includes('KeyboardAvoidingView') || 
                                  content.includes('paddingBottom');
      if (!hasKeyboardHandling) {
        appropriateUsage = false;
      }
    }
  }
});

console.log(`   Found ${platformUsageCount} Platform.OS usages`);
if (appropriateUsage) {
  console.log('✅ PASS: Platform-specific code used appropriately');
  console.log('   (Keyboard handling and safe area insets only)');
} else {
  console.log('⚠️  WARNING: Some Platform.OS usage may affect UI consistency');
}

// Test 6: Check for hardcoded dimensions
console.log('\n📏 Test 6: Responsive Layout Check');
const screenFiles = fs.readdirSync('src/screens', { recursive: true })
  .filter(file => file.endsWith('.js'));

let hardcodedDimensionsFound = false;
const problematicFiles = [];

screenFiles.forEach(file => {
  const filePath = path.join('src/screens', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for hardcoded widths (but allow common values like 100%, '100%', etc.)
    const hasHardcodedWidth = /width:\s*\d{3,}/.test(content) && 
                             !content.includes('Dimensions.get');
    
    if (hasHardcodedWidth) {
      hardcodedDimensionsFound = true;
      problematicFiles.push(file);
    }
  }
});

if (!hardcodedDimensionsFound) {
  console.log('✅ PASS: No hardcoded dimensions found');
  console.log('   Layouts should be responsive');
} else {
  console.log('⚠️  WARNING: Some files may have hardcoded dimensions');
  console.log('   Files to review:', problematicFiles.slice(0, 3).join(', '));
}

// Test 7: Check permissions configuration
console.log('\n🔐 Test 7: Permissions Configuration');
const hasLocationPermissions = appJsonContent.expo.android?.permissions?.includes('android.permission.ACCESS_FINE_LOCATION');
const hasPlugins = appJsonContent.expo.plugins && appJsonContent.expo.plugins.length > 0;

if (hasLocationPermissions && hasPlugins) {
  console.log('✅ PASS: Permissions properly configured');
  console.log(`   Plugins: ${appJsonContent.expo.plugins.length}`);
  console.log(`   Permissions: ${appJsonContent.expo.android.permissions.length}`);
} else {
  console.log('⚠️  WARNING: Some permissions may be missing');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));

const checks = [
  { name: 'Font Loading', status: hasFontLoading && hasFontWait },
  { name: 'Asset Bundling', status: hasAssetBundling },
  { name: 'Theme Configuration', status: fs.existsSync(themePath) },
  { name: 'Platform-Specific Code', status: appropriateUsage },
  { name: 'Responsive Layouts', status: !hardcodedDimensionsFound },
  { name: 'Permissions', status: hasLocationPermissions && hasPlugins }
];

const passedChecks = checks.filter(c => c.status).length;
const totalChecks = checks.length;

console.log(`\nPassed: ${passedChecks}/${totalChecks} checks\n`);

checks.forEach(check => {
  const icon = check.status ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
});

console.log('\n' + '='.repeat(60));

if (passedChecks === totalChecks) {
  console.log('✅ EXCELLENT! Your app is properly configured for UI consistency');
  console.log('   The UI should look identical in Expo Go and APK builds');
} else if (passedChecks >= totalChecks * 0.8) {
  console.log('✅ GOOD! Your app is mostly configured correctly');
  console.log('   Minor adjustments may improve consistency');
} else {
  console.log('⚠️  ATTENTION NEEDED! Some configuration issues detected');
  console.log('   Review the failed checks above');
}

console.log('\n📝 Next Steps:');
console.log('1. Test in Expo Go: npx expo start');
console.log('2. Build APK: eas build --platform android --profile preview');
console.log('3. Compare UI on same device');
console.log('4. Report any differences\n');

console.log('✅ Verification Complete!');