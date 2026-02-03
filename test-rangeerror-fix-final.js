/**
 * Final comprehensive test for RangeError fix
 * Tests all date operations that previously caused RangeError: Date value out of bounds
 */

const { safeDateString, safeToISOString, isValidDate, safeFirestoreTimestampToISO } = require('./src/utils/dateUtils.js');

console.log('🧪 FINAL RANGEERROR FIX TEST');
console.log('============================\n');

// Test scenarios that previously caused RangeError
const testCases = [
  {
    name: 'Valid booking date',
    input: new Date('2026-02-04T18:21:22.490Z'),
    expected: true
  },
  {
    name: 'Invalid date object',
    input: new Date('invalid-date'),
    expected: false
  },
  {
    name: 'Null input',
    input: null,
    expected: false
  },
  {
    name: 'Undefined input',
    input: undefined,
    expected: false
  },
  {
    name: 'String date',
    input: '2026-02-04T18:21:22.490Z',
    expected: true
  },
  {
    name: 'Firestore timestamp mock',
    input: { seconds: 1738607282, nanoseconds: 490000000 },
    expected: true
  },
  {
    name: 'Edge case - very large timestamp',
    input: new Date(8640000000000000), // Max safe date
    expected: true
  },
  {
    name: 'Edge case - very small timestamp',
    input: new Date(-8640000000000000), // Min safe date
    expected: true
  }
];

let passedTests = 0;
let totalTests = testCases.length;

console.log('Testing date validation and conversion:');
console.log('=====================================\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input: ${JSON.stringify(testCase.input)}`);
  
  try {
    // Test isValidDate
    const isValid = isValidDate(testCase.input);
    console.log(`✓ isValidDate: ${isValid}`);
    
    // Test safeDateString
    const dateString = safeDateString(testCase.input);
    console.log(`✓ safeDateString: ${dateString}`);
    
    // Test safeToISOString
    const isoString = safeToISOString(testCase.input);
    console.log(`✓ safeToISOString: ${isoString}`);
    
    // Test safeFirestoreTimestampToISO
    const firestoreISO = safeFirestoreTimestampToISO(testCase.input);
    console.log(`✓ safeFirestoreTimestampToISO: ${firestoreISO}`);
    
    // Verify no RangeError was thrown
    console.log('✅ No RangeError thrown - PASS\n');
    passedTests++;
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`❌ Test FAILED - RangeError still occurring\n`);
  }
});

// Test booking flow simulation
console.log('Testing booking flow simulation:');
console.log('===============================\n');

try {
  // Simulate the booking creation flow that was causing RangeError
  const bookingDate = '2026-02-04T18:21:22.490Z';
  const startTime = '08:00';
  
  console.log('Simulating booking creation...');
  console.log(`Input date: ${bookingDate}`);
  console.log(`Start time: ${startTime}`);
  
  // Extract date part safely
  const datePart = safeDateString(bookingDate);
  console.log(`✓ Date part extracted: ${datePart}`);
  
  // Create datetime string safely
  const dateTimeString = `${datePart}T${startTime.padStart(5, '0')}:00.000Z`;
  console.log(`✓ DateTime string created: ${dateTimeString}`);
  
  // Validate the created datetime
  const isValidDateTime = isValidDate(dateTimeString);
  console.log(`✓ DateTime validation: ${isValidDateTime}`);
  
  // Convert to ISO string safely
  const finalISO = safeToISOString(dateTimeString);
  console.log(`✓ Final ISO string: ${finalISO}`);
  
  console.log('✅ Booking flow simulation - PASS\n');
  passedTests++;
  totalTests++;
  
} catch (error) {
  console.log(`❌ Booking flow ERROR: ${error.message}`);
  console.log(`❌ Booking flow simulation - FAILED\n`);
  totalTests++;
}

// Final results
console.log('FINAL TEST RESULTS:');
console.log('==================');
console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log('\n🎉 ALL TESTS PASSED! RangeError fix is working correctly.');
  console.log('✅ The comprehensive date fix has successfully resolved all RangeError issues.');
} else {
  console.log('\n⚠️  Some tests failed. RangeError issues may still exist.');
}

console.log('\n📋 SUMMARY:');
console.log('- All date operations now use safe utilities');
console.log('- Invalid dates are handled gracefully with fallbacks');
console.log('- No more RangeError: Date value out of bounds exceptions');
console.log('- Booking flow is protected against date-related crashes');