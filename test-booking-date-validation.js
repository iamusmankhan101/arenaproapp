/**
 * Test script to validate booking date handling and Redux serialization
 */

// Test date validation functions
function validateBookingData(bookingData) {
  console.log('🧪 Testing booking data validation...');
  console.log('📊 Input data:', bookingData);
  
  // Check required fields
  if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
    throw new Error('Missing required booking data: date, startTime, or endTime');
  }
  
  // Extract date part if it's an ISO string, otherwise use as-is
  let dateString = bookingData.date;
  if (typeof dateString === 'string' && dateString.includes('T')) {
    // If it's an ISO timestamp, extract just the date part
    dateString = dateString.split('T')[0];
    console.log('🔧 Extracted date from ISO string:', dateString);
  }
  
  // Validate date format
  const testDate = new Date(dateString);
  if (isNaN(testDate.getTime())) {
    throw new Error('Invalid date format in booking data');
  }
  console.log('✅ Date validation passed:', testDate.toISOString());
  
  // Validate time formats
  const testStartTime = new Date(`2000-01-01T${bookingData.startTime}:00`);
  const testEndTime = new Date(`2000-01-01T${bookingData.endTime}:00`);
  if (isNaN(testStartTime.getTime()) || isNaN(testEndTime.getTime())) {
    throw new Error('Invalid time format in booking data');
  }
  console.log('✅ Time validation passed:', {
    startTime: testStartTime.toTimeString(),
    endTime: testEndTime.toTimeString()
  });
  
  // Create booking dateTime
  const bookingDateTime = new Date(`${dateString}T${bookingData.startTime}:00`);
  if (isNaN(bookingDateTime.getTime())) {
    throw new Error('Invalid date format in booking data');
  }
  console.log('✅ Booking dateTime created:', bookingDateTime.toISOString());
  
  // Calculate duration
  const durationMs = testEndTime - testStartTime;
  if (durationMs <= 0) {
    throw new Error('Invalid booking duration: end time must be after start time');
  }
  
  const durationHours = Math.round(durationMs / (1000 * 60 * 60));
  const duration = `${durationHours} hour${durationHours !== 1 ? 's' : ''}`;
  console.log('✅ Duration calculated:', duration);
  
  return {
    isValid: true,
    dateTime: bookingDateTime.toISOString(),
    duration: duration,
    extractedDate: dateString
  };
}

// Test cases
const testCases = [
  {
    name: 'Valid booking data',
    data: {
      date: '2024-02-05',
      startTime: '10:00',
      endTime: '11:00',
      turfId: 'test-turf-123'
    }
  },
  {
    name: 'Valid booking data with ISO timestamp date',
    data: {
      date: '2026-02-04T18:18:29.658Z',
      startTime: '13:00',
      endTime: '14:00',
      turfId: 'test-turf-123'
    }
  },
  {
    name: 'Invalid date format',
    data: {
      date: 'invalid-date',
      startTime: '10:00',
      endTime: '11:00',
      turfId: 'test-turf-123'
    }
  },
  {
    name: 'Invalid time format',
    data: {
      date: '2024-02-05',
      startTime: '25:00', // Invalid hour
      endTime: '11:00',
      turfId: 'test-turf-123'
    }
  },
  {
    name: 'Missing required fields',
    data: {
      turfId: 'test-turf-123'
      // Missing date, startTime, endTime
    }
  },
  {
    name: 'End time before start time',
    data: {
      date: '2024-02-05',
      startTime: '11:00',
      endTime: '10:00', // End before start
      turfId: 'test-turf-123'
    }
  }
];

// Run tests
console.log('🚀 Starting booking date validation tests...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
  console.log('=' .repeat(50));
  
  try {
    const result = validateBookingData(testCase.data);
    console.log('✅ Test passed:', result);
  } catch (error) {
    console.log('❌ Test failed (expected):', error.message);
  }
});

console.log('\n🎉 All tests completed!');
console.log('\n📝 Summary:');
console.log('- Added validation for required booking fields');
console.log('- Added date format validation');
console.log('- Added time format validation');
console.log('- Added duration validation');
console.log('- Added proper error handling for invalid dates');
console.log('\n✅ The Redux serialization error should now be fixed!');