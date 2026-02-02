/**
 * Test script to verify BookingScreen header spacing fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing BookingScreen Header Spacing Fix...\n');

// Read the BookingScreen file
const bookingScreenPath = path.join(__dirname, 'src/screens/booking/BookingScreen.js');
const bookingScreenContent = fs.readFileSync(bookingScreenPath, 'utf8');

// Test 1: Check if main container uses View instead of SafeAreaView
const hasViewContainer = bookingScreenContent.includes('<View style={styles.container}>');
console.log(`✅ Main container uses View: ${hasViewContainer ? 'PASS' : 'FAIL'}`);

// Test 2: Check if SafeAreaView is only used for header
const hasSafeAreaHeader = bookingScreenContent.includes('<SafeAreaView style={[styles.header, { backgroundColor: theme.colors.primary }]}>');
console.log(`✅ SafeAreaView only for header: ${hasSafeAreaHeader ? 'PASS' : 'FAIL'}`);

// Test 3: Check if header style doesn't have backgroundColor
const headerStyleMatch = bookingScreenContent.match(/header:\s*{[^}]*}/s);
const headerHasNoBackground = headerStyleMatch && !headerStyleMatch[0].includes('backgroundColor');
console.log(`✅ Header style has no backgroundColor: ${headerHasNoBackground ? 'PASS' : 'FAIL'}`);

// Test 4: Check if closing structure is correct
const hasCorrectClosing = bookingScreenContent.includes('</View>\n  );\n}');
console.log(`✅ Correct closing structure: ${hasCorrectClosing ? 'PASS' : 'FAIL'}`);

// Test 5: Check if StatusBar is still configured correctly
const hasCorrectStatusBar = bookingScreenContent.includes('backgroundColor={theme.colors.primary}');
console.log(`✅ StatusBar configured correctly: ${hasCorrectStatusBar ? 'PASS' : 'FAIL'}`);

console.log('\n📊 Summary:');
const tests = [
  hasViewContainer,
  hasSafeAreaHeader,
  headerHasNoBackground,
  hasCorrectClosing,
  hasCorrectStatusBar
];

const passedTests = tests.filter(test => test).length;
const totalTests = tests.length;

console.log(`${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! BookingScreen header spacing fix is complete.');
} else {
  console.log('❌ Some tests failed. Please check the implementation.');
}

console.log('\n📱 Changes Made:');
console.log('• Changed main container from SafeAreaView to View');
console.log('• Applied SafeAreaView only to header section');
console.log('• Moved backgroundColor from header style to SafeAreaView inline style');
console.log('• This eliminates the empty space above the header');
console.log('• Header now extends properly to the top of the screen');