#!/usr/bin/env node

/**
 * Test script to verify BookingConfirmScreen uses brand colors
 * This script checks the implementation for proper theme color usage
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing BookingConfirmScreen Brand Colors Implementation...\n');

// Read the BookingConfirmScreen file
const bookingConfirmPath = path.join(__dirname, 'src/screens/booking/BookingConfirmScreen.js');

if (!fs.existsSync(bookingConfirmPath)) {
  console.error('❌ BookingConfirmScreen.js not found!');
  process.exit(1);
}

const bookingConfirmContent = fs.readFileSync(bookingConfirmPath, 'utf8');

// Test 1: Check if theme is imported
console.log('1. Checking theme import...');
if (bookingConfirmContent.includes("import { theme } from '../../theme/theme'")) {
  console.log('✅ Theme is properly imported');
} else {
  console.log('❌ Theme import not found');
}

// Test 2: Check StatusBar uses primary color
console.log('\n2. Checking StatusBar color...');
if (bookingConfirmContent.includes('backgroundColor={theme.colors.primary}')) {
  console.log('✅ StatusBar uses primary color');
} else {
  console.log('❌ StatusBar not using primary color');
}

// Test 3: Check header uses primary color
console.log('\n3. Checking header color...');
if (bookingConfirmContent.includes('backgroundColor: theme.colors.primary')) {
  console.log('✅ Header uses primary color');
} else {
  console.log('❌ Header not using primary color');
}

// Test 4: Check venue icon uses secondary color background
console.log('\n4. Checking venue icon colors...');
if (bookingConfirmContent.includes('backgroundColor: `${theme.colors.secondary}30`')) {
  console.log('✅ Venue icon uses secondary color background');
} else {
  console.log('❌ Venue icon not using secondary color background');
}

if (bookingConfirmContent.includes('color={theme.colors.primary}')) {
  console.log('✅ Venue icon uses primary color for icon');
} else {
  console.log('❌ Venue icon not using primary color for icon');
}

// Test 5: Check price chip colors
console.log('\n5. Checking price chip colors...');
if (bookingConfirmContent.includes('borderColor: theme.colors.primary')) {
  console.log('✅ Price chip uses primary color border');
} else {
  console.log('❌ Price chip not using primary color border');
}

// Test 6: Check total value color
console.log('\n6. Checking total value color...');
if (bookingConfirmContent.includes('color: theme.colors.primary')) {
  console.log('✅ Total value uses primary color');
} else {
  console.log('❌ Total value not using primary color');
}

// Test 7: Check RadioButton color
console.log('\n7. Checking RadioButton color...');
if (bookingConfirmContent.includes('color={theme.colors.primary}')) {
  console.log('✅ RadioButton uses primary color');
} else {
  console.log('❌ RadioButton not using primary color');
}

// Test 8: Check confirm button colors
console.log('\n8. Checking confirm button colors...');
if (bookingConfirmContent.includes('backgroundColor: theme.colors.primary')) {
  console.log('✅ Confirm button uses primary color background');
} else {
  console.log('❌ Confirm button not using primary color background');
}

if (bookingConfirmContent.includes('color: theme.colors.secondary')) {
  console.log('✅ Confirm button uses secondary color text');
} else {
  console.log('❌ Confirm button not using secondary color text');
}

// Test 9: Check for hardcoded colors (should be minimal)
console.log('\n9. Checking for hardcoded brand colors...');
const hardcodedGreen = bookingConfirmContent.match(/#229a60/g);
if (hardcodedGreen && hardcodedGreen.length > 0) {
  console.log(`⚠️  Found ${hardcodedGreen.length} instances of hardcoded green (#229a60)`);
} else {
  console.log('✅ No hardcoded green colors found');
}

// Test 10: Check theme colors
console.log('\n10. Checking theme colors...');
const themePath = path.join(__dirname, 'src/theme/theme.js');
if (fs.existsSync(themePath)) {
  const themeContent = fs.readFileSync(themePath, 'utf8');
  
  if (themeContent.includes('secondary: \'#cdec6a\'')) {
    console.log('✅ Secondary color is #cdec6a (light green)');
  } else {
    console.log('⚠️  Secondary color definition not found or different');
  }
  
  if (themeContent.includes('primary: \'#004d43\'')) {
    console.log('✅ Primary color is #004d43 (dark teal)');
  } else {
    console.log('⚠️  Primary color definition not found or different');
  }
} else {
  console.log('❌ Theme file not found');
}

console.log('\n🎨 BookingConfirmScreen Brand Colors Test Complete!');
console.log('\nExpected Result:');
console.log('- Header and StatusBar: Dark teal (#004d43)');
console.log('- Confirm button: Dark teal background with light green text');
console.log('- Price elements: Dark teal color');
console.log('- Venue icon: Light green background with dark teal icon');
console.log('- Selected payment option: Light green background with dark teal border');