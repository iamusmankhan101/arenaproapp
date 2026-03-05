// Debug script to investigate booking filtering issues
// Run this to understand why bookings aren't showing in the list

const debugBookingFiltering = () => {
  console.log('🔍 DEBUGGING: Booking filtering logic');
  
  // Sample booking data structure (based on createBooking function)
  const sampleBooking = {
    id: 'test123',
    turfName: 'Test Venue',
    turfArea: 'Test Area',
    sport: 'Football',
    dateTime: new Date().toISOString(), // Current time
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 2000,
    duration: '1 hour',
    bookingId: 'PIT123456'
  };
  
  console.log('📋 Sample booking:', sampleBooking);
  
  // Test filtering logic
  const now = new Date();
  console.log('⏰ Current time:', now.toISOString());
  
  const bookingDate = new Date(sampleBooking.dateTime);
  console.log('📅 Booking date:', bookingDate.toISOString());
  
  // Test upcoming filter
  const isUpcoming = bookingDate > now && sampleBooking.status !== 'cancelled';
  console.log('🔮 Is upcoming?', isUpcoming);
  
  // Test past filter
  const isPast = bookingDate <= now || sampleBooking.status === 'completed';
  console.log('📜 Is past?', isPast);
  
  // Test cancelled filter
  const isCancelled = sampleBooking.status === 'cancelled';
  console.log('❌ Is cancelled?', isCancelled);
  
  console.log('🎯 CONCLUSION: Booking should appear in:', 
    isUpcoming ? 'UPCOMING' : isPast ? 'PAST' : 'NONE');
};

// Run the debug
debugBookingFiltering();