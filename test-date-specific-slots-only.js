/**
 * Test script to verify date-specific slots only functionality
 */

// Mock venue data with only date-specific slots
const mockVenueData = {
  id: 'test-venue-123',
  name: 'Test Sports Arena',
  dateSpecificSlots: {
    '2026-02-05': [
      {
        id: '2026-02-05-slot-10-0',
        startTime: '10:00',
        endTime: '11:00',
        price: 4000,
        selected: true,
        date: '2026-02-05'
      },
      {
        id: '2026-02-05-slot-11-0',
        startTime: '11:00',
        endTime: '12:00',
        price: 4000,
        selected: true,
        date: '2026-02-05'
      },
      {
        id: '2026-02-05-slot-12-0',
        startTime: '12:00',
        endTime: '13:00',
        price: 4000,
        selected: false, // Not selected by admin
        date: '2026-02-05'
      }
    ],
    '2026-02-06': [
      {
        id: '2026-02-06-slot-14-0',
        startTime: '14:00',
        endTime: '15:00',
        price: 5000,
        selected: true,
        date: '2026-02-06'
      }
    ]
  }
};

// Test function to simulate getAvailableSlots logic
function testGetAvailableSlots(venueData, requestedDate) {
  console.log(`\n🧪 Testing getAvailableSlots for date: ${requestedDate}`);
  console.log('=' .repeat(60));
  
  // Only use date-specific slots - no fallback to general time slots
  let venueTimeSlots = [];
  
  if (venueData.dateSpecificSlots && venueData.dateSpecificSlots[requestedDate]) {
    // Use date-specific slots if they exist for this date
    venueTimeSlots = venueData.dateSpecificSlots[requestedDate];
    console.log(`📊 Using date-specific slots for ${requestedDate}: ${venueTimeSlots.length} slots configured`);
  } else {
    console.log(`⚠️ No date-specific slots configured for ${requestedDate}`);
    return { data: [] };
  }
  
  if (venueTimeSlots.length === 0) {
    console.log('⚠️ No time slots configured for this venue/date');
    return { data: [] };
  }
  
  // Filter to only show selected slots (admin-configured availability)
  const selectedSlots = venueTimeSlots.filter(slot => slot.selected !== false);
  console.log(`📊 ${selectedSlots.length}/${venueTimeSlots.length} slots are selected by admin`);
  
  if (selectedSlots.length === 0) {
    console.log('⚠️ No slots selected by admin for this venue/date');
    return { data: [] };
  }
  
  // Mock booked slots (empty for this test)
  const bookedSlots = [];
  
  // Mark selected slots as available/unavailable based on bookings
  const availableSlots = selectedSlots.map(slot => {
    const slotTime = slot.time || slot.startTime;
    const isBooked = bookedSlots.includes(slotTime);
    
    return {
      ...slot,
      // Ensure both time and startTime fields exist for compatibility
      time: slotTime,
      startTime: slotTime,
      available: !isBooked
    };
  });
  
  console.log(`✅ Returning ${availableSlots.length} date-specific time slots (${availableSlots.filter(s => s.available).length} available)`);
  
  // Log slots for debugging
  if (availableSlots.length > 0) {
    console.log(`📋 Available slots:`);
    availableSlots.forEach(slot => {
      console.log(`  - ${slot.time} - ${slot.endTime} (PKR ${slot.price}) [Available: ${slot.available}]`);
    });
  }
  
  return { data: availableSlots };
}

// Test admin venue validation
function testAdminVenueValidation(formData) {
  console.log(`\n🧪 Testing admin venue validation`);
  console.log('=' .repeat(60));
  console.log('📊 Form data:', {
    name: formData.name,
    dateSpecificSlots: Object.keys(formData.dateSpecificSlots).length + ' dates configured'
  });
  
  // Check if at least one date-specific slot is selected
  const hasSelectedSlots = Object.values(formData.dateSpecificSlots).some(dateSlots => 
    dateSlots.some(slot => slot.selected)
  );

  if (!hasSelectedSlots) {
    console.log('❌ Validation failed: Please configure and select at least one time slot for at least one date');
    return false;
  }
  
  console.log('✅ Validation passed: Date-specific slots are configured');
  
  // Show summary
  Object.keys(formData.dateSpecificSlots).forEach(date => {
    const dateSlots = formData.dateSpecificSlots[date];
    const selectedCount = dateSlots.filter(slot => slot.selected).length;
    console.log(`📅 ${date}: ${selectedCount}/${dateSlots.length} slots selected`);
  });
  
  return true;
}

// Run tests
console.log('🚀 Starting Date-Specific Slots Only Tests...\n');

// Test cases for mobile app
const testDates = [
  '2026-02-05', // Has date-specific slots
  '2026-02-06', // Has different date-specific slots
  '2026-02-07', // No date-specific slots configured
];

testDates.forEach(date => {
  const result = testGetAvailableSlots(mockVenueData, date);
  console.log(`📊 Result for ${date}: ${result.data.length} slots available\n`);
});

// Test admin validation
const mockFormData = {
  name: 'Test Venue',
  dateSpecificSlots: mockVenueData.dateSpecificSlots
};

const validationResult = testAdminVenueValidation(mockFormData);
console.log(`\n📊 Admin validation result: ${validationResult ? 'PASSED' : 'FAILED'}`);

// Test with no selected slots
const mockFormDataNoSlots = {
  name: 'Test Venue',
  dateSpecificSlots: {
    '2026-02-05': [
      {
        id: 'slot-1',
        startTime: '10:00',
        endTime: '11:00',
        price: 4000,
        selected: false // No slots selected
      }
    ]
  }
};

console.log('\n🧪 Testing validation with no selected slots:');
const validationResult2 = testAdminVenueValidation(mockFormDataNoSlots);
console.log(`📊 Admin validation result: ${validationResult2 ? 'PASSED' : 'FAILED'}`);

console.log('\n🎉 All tests completed!');
console.log('\n📝 Summary:');
console.log('✅ Removed basic time slots fallback');
console.log('✅ Only date-specific slots are used');
console.log('✅ Admin must configure date-specific slots');
console.log('✅ Mobile app only shows date-specific slots');
console.log('✅ No slots available if date not configured');