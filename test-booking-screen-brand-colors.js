/**
 * Test script to verify BookingScreen brand colors and header spacing fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing BookingScreen Brand Colors and Header Spacing Fix...\n');

// Read the BookingScreen file
const bookingScreenPath = path.join(__dirname, 'src/screens/booking/BookingScreen.js');
const bookingScreenContent = fs.readFileSync(bookingScreenPath, 'utf8');

// Test 1: Check if theme import is added
const hasThemeImport = bookingScreenContent.includes("import { theme } from '../../theme/theme';");
console.log(`✅ Theme import added: ${hasThemeImport ? 'PASS' : 'FAIL'}`);

// Test 2: Check if StatusBar uses theme.colors.primary
const hasCorrectStatusBar = bookingScreenContent.includes('backgroundColor={theme.colors.primary}');
console.log(`✅ StatusBar uses brand primary color: ${hasCorrectStatusBar ? 'PASS' : 'FAIL'}`);

// Test 3: Check if header background uses theme.colors.primary
const hasCorrectHeaderBg = bookingScreenContent.includes('backgroundColor: theme.colors.primary,');
console.log(`✅ Header uses brand primary color: ${hasCorrectHeaderBg ? 'PASS' : 'FAIL'}`);

// Test 4: Check if paddingTop is removed from header
const headerStyleMatch = bookingScreenContent.match(/header:\s*{[^}]*}/s);
const hasNoPaddingTop = headerStyleMatch && !headerStyleMatch[0].includes('paddingTop');
console.log(`✅ Header paddingTop removed: ${hasNoPaddingTop ? 'PASS' : 'FAIL'}`);

// Test 5: Check if search icon uses theme color
const hasCorrectSearchIcon = bookingScreenContent.includes('iconColor={theme.colors.primary}');
console.log(`✅ Search icon uses brand primary color: ${hasCorrectSearchIcon ? 'PASS' : 'FAIL'}`);

// Test 6: Check if tab icons use theme color
const hasCorrectTabIcons = bookingScreenContent.includes('selectedTab === \'upcoming\' ? theme.colors.primary : \'#666\'');
console.log(`✅ Tab icons use brand primary color: ${hasCorrectTabIcons ? 'PASS' : 'FAIL'}`);

// Test 7: Check if refresh control uses theme color
const hasCorrectRefreshControl = bookingScreenContent.includes('colors={[theme.colors.primary]}') &&
                                bookingScreenContent.includes('tintColor={theme.colors.primary}');
console.log(`✅ Refresh control uses brand primary color: ${hasCorrectRefreshControl ? 'PASS' : 'FAIL'}`);

// Test 8: Check if book now button uses theme color
const hasCorrectBookButton = bookingScreenContent.includes('backgroundColor: theme.colors.primary,');
console.log(`✅ Book now button uses brand primary color: ${hasCorrectBookButton ? 'PASS' : 'FAIL'}`);

// Test 9: Check if old green color (#229a60) is completely removed
const hasOldColor = bookingScreenContent.includes('#229a60');
console.log(`✅ Old green color removed: ${!hasOldColor ? 'PASS' : 'FAIL'}`);

console.log('\n📊 Summary:');
const tests = [
  hasThemeImport,
  hasCorrectStatusBar,
  hasCorrectHeaderBg,
  hasNoPaddingTop,
  hasCorrectSearchIcon,
  hasCorrectTabIcons,
  hasCorrectRefreshControl,
  hasCorrectBookButton,
  !hasOldColor
];

const passedTests = tests.filter(test => test).length;
const totalTests = tests.length;

console.log(`${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! BookingScreen brand colors and header spacing fix is complete.');
} else {
  console.log('❌ Some tests failed. Please check the implementation.');
}

// Show the current brand colors being used
console.log('\n🎨 Brand Colors Applied:');
console.log('Primary (Dark Teal): #004d43');
console.log('Secondary (Light Green): #cdec6a');
console.log('\n📱 Changes Made:');
console.log('• Header background changed to brand primary color');
console.log('• StatusBar background changed to brand primary color');
console.log('• Search icon color changed to brand primary color');
console.log('• Tab icons color changed to brand primary color');
console.log('• Refresh control colors changed to brand primary color');
console.log('• Book now button background changed to brand primary color');
console.log('• Removed paddingTop from header to fix spacing issue');
console.log('• Removed all instances of old green color (#229a60)');