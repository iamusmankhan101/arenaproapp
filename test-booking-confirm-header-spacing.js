#!/usr/bin/env node

/**
 * Test script to verify BookingConfirmScreen header spacing fix
 * This script checks the layout structure to ensure no white space above header
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing BookingConfirmScreen Header Spacing Fix...\n');

// Read the BookingConfirmScreen file
const bookingConfirmPath = path.join(__dirname, 'src/screens/booking/BookingConfirmScreen.js');

if (!fs.existsSync(bookingConfirmPath)) {
  console.error('❌ BookingConfirmScreen.js not found!');
  process.exit(1);
}

const bookingConfirmContent = fs.readFileSync(bookingConfirmPath, 'utf8');

// Test 1: Check container structure
console.log('1. Checking container structure...');
if (bookingConfirmContent.includes('<View style={styles.container}>')) {
  console.log('✅ Main container uses View instead of SafeAreaView');
} else {
  console.log('❌ Main container structure issue');
}

// Test 2: Check header structure
console.log('\n2. Checking header structure...');
if (bookingConfirmContent.includes('<SafeAreaView style={[styles.header, { backgroundColor: theme.colors.primary }]}>')) {
  console.log('✅ Header uses SafeAreaView with primary color background');
} else {
  console.log('❌ Header structure issue');
}

// Test 3: Check headerContent structure
console.log('\n3. Checking headerContent structure...');
if (bookingConfirmContent.includes('<View style={styles.headerContent}>')) {
  console.log('✅ Header content properly wrapped');
} else {
  console.log('❌ Header content structure issue');
}

// Test 4: Check StatusBar configuration
console.log('\n4. Checking StatusBar configuration...');
if (bookingConfirmContent.includes('backgroundColor={theme.colors.primary}')) {
  console.log('✅ StatusBar uses primary color background');
} else {
  console.log('❌ StatusBar configuration issue');
}

// Test 5: Check styles structure
console.log('\n5. Checking styles structure...');
if (bookingConfirmContent.includes('headerContent: {')) {
  console.log('✅ headerContent style defined');
} else {
  console.log('❌ headerContent style missing');
}

// Test 6: Check for proper closing tags
console.log('\n6. Checking closing tags...');
if (bookingConfirmContent.includes('</SafeAreaView>') && bookingConfirmContent.includes('</View>')) {
  console.log('✅ Proper closing tags found');
} else {
  console.log('❌ Closing tags issue');
}

// Test 7: Check header style separation
console.log('\n7. Checking header style separation...');
const headerStyleMatch = bookingConfirmContent.match(/header:\s*{[^}]*}/s);
if (headerStyleMatch) {
  const headerStyle = headerStyleMatch[0];
  if (!headerStyle.includes('flexDirection') && !headerStyle.includes('paddingHorizontal')) {
    console.log('✅ Header style properly separated from content positioning');
  } else {
    console.log('❌ Header style still contains content positioning');
  }
} else {
  console.log('⚠️  Could not find header style definition');
}

console.log('\n🎨 BookingConfirmScreen Header Spacing Test Complete!');
console.log('\nExpected Result:');
console.log('- No white space above header');
console.log('- Header extends to top of screen with StatusBar');
console.log('- SafeAreaView only applied to header content');
console.log('- Main container uses View for full screen coverage');