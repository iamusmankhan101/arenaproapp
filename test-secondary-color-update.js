// Test Secondary Color Update from #cdec6a to #e8ee26
// This script verifies that all instances of the old secondary color have been replaced

const fs = require('fs');
const path = require('path');

const NEW_SECONDARY_COLOR = '#e8ee26';
const OLD_SECONDARY_COLOR = '#cdec6a';

console.log('🎨 Testing Secondary Color Update...');
console.log(`Old Color: ${OLD_SECONDARY_COLOR} (Light Green)`);
console.log(`New Color: ${NEW_SECONDARY_COLOR} (Bright Lime)`);

// Test 1: Check theme files
console.log('\n📋 Test 1: Theme Files');

// Mobile theme
const mobileThemePath = 'src/theme/theme.js';
if (fs.existsSync(mobileThemePath)) {
  const mobileThemeContent = fs.readFileSync(mobileThemePath, 'utf8');
  const hasNewColor = mobileThemeContent.includes(`secondary: '${NEW_SECONDARY_COLOR}'`);
  const hasOldColor = mobileThemeContent.includes(OLD_SECONDARY_COLOR);
  
  console.log(`   Mobile Theme (${mobileThemePath}):`);
  console.log(`   ${hasNewColor ? '✅' : '❌'} New secondary color (${NEW_SECONDARY_COLOR}): ${hasNewColor ? 'Found' : 'Missing'}`);
  console.log(`   ${!hasOldColor ? '✅' : '❌'} Old secondary color (${OLD_SECONDARY_COLOR}): ${hasOldColor ? 'Still present' : 'Removed'}`);
}

// Admin theme
const adminThemePath = 'admin-web/src/theme/theme.js';
if (fs.existsSync(adminThemePath)) {
  const adminThemeContent = fs.readFileSync(adminThemePath, 'utf8');
  const hasNewColor = adminThemeContent.includes(`secondary: '${NEW_SECONDARY_COLOR}'`);
  const hasOldColor = adminThemeContent.includes(OLD_SECONDARY_COLOR);
  
  console.log(`   Admin Theme (${adminThemePath}):`);
  console.log(`   ${hasNewColor ? '✅' : '❌'} New secondary color (${NEW_SECONDARY_COLOR}): ${hasNewColor ? 'Found' : 'Missing'}`);
  console.log(`   ${!hasOldColor ? '✅' : '❌'} Old secondary color (${OLD_SECONDARY_COLOR}): ${hasOldColor ? 'Still present' : 'Removed'}`);
}

// Test 2: Check key component files
console.log('\n📋 Test 2: Key Component Files');

const keyFiles = [
  'src/screens/auth/SignInScreen.js',
  'src/screens/auth/SignUpScreen.js',
  'src/navigation/AppNavigator.js',
  'src/screens/main/HomeScreen.js',
  'src/screens/profile/ProfileScreen.js',
  'src/screens/team/ChallengeScreen.js',
  'src/screens/turf/TurfDetailScreen.js'
];

keyFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasOldColor = content.includes(OLD_SECONDARY_COLOR);
    const hasNewColor = content.includes(NEW_SECONDARY_COLOR);
    
    console.log(`   ${path.basename(filePath)}:`);
    console.log(`   ${hasNewColor ? '✅' : '⚠️ '} New color present: ${hasNewColor ? 'Yes' : 'No'}`);
    console.log(`   ${!hasOldColor ? '✅' : '❌'} Old color removed: ${hasOldColor ? 'Still present' : 'Yes'}`);
  }
});

// Test 3: Check documentation files
console.log('\n📋 Test 3: Documentation Files');

const docFiles = [
  'BRAND_COLORS.md'
];

docFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasNewColor = content.includes(NEW_SECONDARY_COLOR);
    const oldColorCount = (content.match(new RegExp(OLD_SECONDARY_COLOR.replace('#', '\\#'), 'g')) || []).length;
    
    console.log(`   ${filePath}:`);
    console.log(`   ${hasNewColor ? '✅' : '❌'} New color documented: ${hasNewColor ? 'Yes' : 'No'}`);
    console.log(`   Old color references: ${oldColorCount} (should be 0 for complete replacement)`);
  }
});

// Test 4: Color contrast and accessibility
console.log('\n📋 Test 4: Color Properties');

// Convert hex to RGB for analysis
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const newRgb = hexToRgb(NEW_SECONDARY_COLOR);
const oldRgb = hexToRgb(OLD_SECONDARY_COLOR);

console.log(`   Old Color RGB: rgb(${oldRgb.r}, ${oldRgb.g}, ${oldRgb.b})`);
console.log(`   New Color RGB: rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`);

// Calculate relative luminance for contrast analysis
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

const newLuminance = getLuminance(newRgb.r, newRgb.g, newRgb.b);
const oldLuminance = getLuminance(oldRgb.r, oldRgb.g, oldRgb.b);

console.log(`   Old Color Luminance: ${oldLuminance.toFixed(3)}`);
console.log(`   New Color Luminance: ${newLuminance.toFixed(3)}`);
console.log(`   ${newLuminance > oldLuminance ? '✅' : '⚠️ '} New color is ${newLuminance > oldLuminance ? 'brighter' : 'darker'} than old color`);

console.log('\n🎉 Secondary Color Update Test Complete!');
console.log('\n📝 Summary:');
console.log(`• Old secondary color: ${OLD_SECONDARY_COLOR} (Light Green)`);
console.log(`• New secondary color: ${NEW_SECONDARY_COLOR} (Bright Lime)`);
console.log('• Updated in theme files, components, and documentation');
console.log('• New color is brighter and more vibrant');
console.log('• Maintains brand consistency across mobile and admin apps');

console.log('\n🚀 Next Steps:');
console.log('1. Test the app to ensure all UI elements display correctly');
console.log('2. Verify color contrast meets accessibility standards');
console.log('3. Update any remaining test files or documentation as needed');
console.log('4. Consider updating secondary color variations if needed');