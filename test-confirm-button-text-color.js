#!/usr/bin/env node

/**
 * Test script to verify confirm button text color
 * This script checks the TurfDetailScreen modal button implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Confirm Button Text Color Implementation...\n');

// Read the TurfDetailScreen file
const turfDetailPath = path.join(__dirname, 'src/screens/turf/TurfDetailScreen.js');

if (!fs.existsSync(turfDetailPath)) {
  console.error('❌ TurfDetailScreen.js not found!');
  process.exit(1);
}

const turfDetailContent = fs.readFileSync(turfDetailPath, 'utf8');

// Test 1: Check if confirm button uses secondary color for text
console.log('1. Checking confirm button text color...');
const confirmButtonMatch = turfDetailContent.match(/Confirm Booking[\s\S]*?<\/Button>/);
if (confirmButtonMatch) {
  const confirmButtonCode = confirmButtonMatch[0];
  if (confirmButtonCode.includes('textColor={theme.colors.secondary}')) {
    console.log('✅ Confirm button is set to use secondary color for text');
  } else {
    console.log('❌ Confirm button is not using secondary color for text');
  }
  
  if (confirmButtonCode.includes('disabled={!selectedTimeSlot}')) {
    console.log('⚠️  Confirm button is disabled when no time slot selected - this might override text color');
  }
} else {
  console.log('❌ Could not find Confirm Booking button');
}

// Test 2: Check cancel button for comparison
console.log('\n2. Checking cancel button text color...');
const cancelButtonMatch = turfDetailContent.match(/Cancel[\s\S]*?<\/Button>/);
if (cancelButtonMatch) {
  const cancelButtonCode = cancelButtonMatch[0];
  if (cancelButtonCode.includes('textColor={theme.colors.primary}')) {
    console.log('✅ Cancel button is using primary color for text (correct)');
  } else {
    console.log('❌ Cancel button text color issue');
  }
} else {
  console.log('❌ Could not find Cancel button');
}

// Test 3: Check theme colors
console.log('\n3. Checking theme colors...');
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

console.log('\n🎨 Confirm Button Text Color Test Complete!');
console.log('\nExpected Result:');
console.log('- Confirm button should have light green (#cdec6a) text on dark teal background');
console.log('- Cancel button should have dark teal (#004d43) text on light green background');
console.log('- Text colors should be visible even when button is disabled');