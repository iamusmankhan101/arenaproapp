// Fix Booking Not Showing with Debug Logging
// This script adds comprehensive logging to identify the exact issue

const fs = require('fs');

console.log('🔧 FIXING: Booking Not Showing with Debug Logging');
console.log('================================================');

// Enhanced createBooking function with extensive logging
const enhancedCreateBookingFunction = `
  // Create booking with extensive debugging
  async createBooking(bookingData) {
    console.log('🔥 FIREBASE: createBooking called with data:', bookingData);
    
    try {
      const user = auth.currentUser;
      console.log('🔥 FIREBASE: Current user:', user ? { uid: user.uid, email: user.email } : 'No user');
      
      if (!user) {
        console.log('⚠️ FIREBASE: User not authenticated, creating guest booking');
        // Guest booking logic remains the same...
        const guestId = \`guest_\${Date.now()}\`;
        
        const bookingRef = await addDoc(collection(db, 'bookings'), {
          ...bookingData,
          userId: guestId,
          userType: 'guest',
          status: 'pending',
          paymentStatus: 'pending',
          bookingReference: \`PIT\${Date.now().toString().slice(-6)}\`,
          createdAt: serverTimestamp(),
          guestInfo: {
            requiresSignIn: true,
            message: 'Please sign in to complete your booking'
          }
        });
        
        console.log('🔥 FIREBASE: Guest booking created with ID:', bookingRef.id);
        
        return { 
          data: { 
            id: bookingRef.id, 
            ...bookingData,
            status: 'pending',
            paymentStatus: 'pending',
            bookingReference: \`PIT\${Date.now().toString().slice(-6)}\`,
            requiresSignIn: true,
            message: 'Booking created! Please sign in to complete your booking.'
          } 
        };
      }
      
      console.log('🔥 FIREBASE: Authenticated user booking - fetching venue details...');
      
      // Get venue details to enrich booking data
      let venueDetails = {};
      try {
        console.log('🔥 FIREBASE: Fetching venue document for turfId:', bookingData.turfId);
        const venueDoc = await getDoc(doc(db, 'venues', bookingData.turfId));
        
        if (venueDoc.exists()) {
          const venueData = venueDoc.data();
          console.log('🔥 FIREBASE: Venue data found:', {
            name: venueData.name,
            area: venueData.area,
            address: venueData.address,
            sport: venueData.sport
          });
          
          venueDetails = {
            turfName: venueData.name,
            turfArea: venueData.area || venueData.address,
            sport: venueData.sport || 'Football',
            phoneNumber: venueData.phoneNumber,
            address: venueData.address
          };
        } else {
          console.log('⚠️ FIREBASE: Venue document not found for turfId:', bookingData.turfId);
          venueDetails = {
            turfName: 'Sports Venue',
            turfArea: 'Unknown Area',
            sport: 'Football',
            phoneNumber: 'N/A',
            address: 'N/A'
          };
        }
      } catch (venueError) {
        console.error('❌ FIREBASE: Error fetching venue details:', venueError);
        venueDetails = {
          turfName: 'Sports Venue',
          turfArea: 'Unknown Area',
          sport: 'Football',
          phoneNumber: 'N/A',
          address: 'N/A'
        };
      }
      
      console.log('🔥 FIREBASE: Venue details prepared:', venueDetails);
      
      // Create proper dateTime from date and startTime
      console.log('🔥 FIREBASE: Creating dateTime from:', { date: bookingData.date, startTime: bookingData.startTime });
      const bookingDateTime = new Date(\`\${bookingData.date}T\${bookingData.startTime}:00\`);
      console.log('🔥 FIREBASE: Created dateTime:', bookingDateTime.toISOString());
      
      // Calculate duration
      const startTime = new Date(\`2000-01-01T\${bookingData.startTime}:00\`);
      const endTime = new Date(\`2000-01-01T\${bookingData.endTime}:00\`);
      const durationMs = endTime - startTime;
      const durationHours = Math.round(durationMs / (1000 * 60 * 60));
      const duration = \`\${durationHours} hour\${durationHours !== 1 ? 's' : ''}\`;
      console.log('🔥 FIREBASE: Calculated duration:', duration);
      
      // Generate unique booking ID
      const bookingId = \`PIT\${Date.now().toString().slice(-6)}\`;
      console.log('🔥 FIREBASE: Generated booking ID:', bookingId);
      
      // Authenticated user booking with enriched data
      const enrichedBookingData = {
        ...bookingData,
        ...venueDetails,
        userId: user.uid,
        userType: 'authenticated',
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingReference: bookingId,
        bookingId: bookingId,
        dateTime: bookingDateTime.toISOString(),
        duration: duration,
        createdAt: serverTimestamp()
      };
      
      console.log('🔥 FIREBASE: Final enriched booking data:', {
        ...enrichedBookingData,
        createdAt: '[ServerTimestamp]' // Don't log the actual timestamp object
      });
      
      console.log('🔥 FIREBASE: Saving booking to Firestore...');
      const bookingRef = await addDoc(collection(db, 'bookings'), enrichedBookingData);
      console.log('🔥 FIREBASE: Booking saved successfully with ID:', bookingRef.id);
      
      const finalResult = { 
        data: { 
          id: bookingRef.id, 
          ...enrichedBookingData,
          requiresSignIn: false,
          message: 'Booking confirmed successfully!'
        } 
      };
      
      console.log('🔥 FIREBASE: Returning booking result:', {
        ...finalResult,
        data: {
          ...finalResult.data,
          createdAt: '[ServerTimestamp]'
        }
      });
      
      return finalResult;
    } catch (error) {
      console.error('❌ FIREBASE: Error creating booking:', error);
      console.error('❌ FIREBASE: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },`;

// Enhanced getUserBookings function with extensive logging
const enhancedGetUserBookingsFunction = `
  // Get user bookings with extensive debugging
  async getUserBookings() {
    console.log('🔥 FIREBASE: getUserBookings called');
    
    try {
      const user = auth.currentUser;
      console.log('🔥 FIREBASE: Current user for getUserBookings:', user ? { uid: user.uid, email: user.email } : 'No user');
      
      if (!user) {
        console.log('⚠️ FIREBASE: User not authenticated, returning empty bookings');
        return { data: [] };
      }
      
      console.log('🔥 FIREBASE: Querying bookings for userId:', user.uid);
      
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      console.log('🔥 FIREBASE: Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log('🔥 FIREBASE: Query completed. Document count:', snapshot.docs.length);
      
      const bookings = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log('🔥 FIREBASE: Processing booking document:', {
          id: data.id,
          turfName: data.turfName,
          dateTime: data.dateTime,
          status: data.status,
          userId: data.userId
        });
        return data;
      });
      
      console.log('🔥 FIREBASE: Final bookings array:', bookings.map(b => ({
        id: b.id,
        turfName: b.turfName,
        dateTime: b.dateTime,
        status: b.status
      })));
      
      return { data: bookings };
    } catch (error) {
      console.error('❌ FIREBASE: Error fetching user bookings:', error);
      console.error('❌ FIREBASE: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return { data: [] };
    }
  },`;

// Enhanced Redux actions with logging
const enhancedReduxActions = `
// Enhanced fetchUserBookings with logging
export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    console.log('🔄 REDUX: fetchUserBookings action called');
    
    try {
      const bookingAPI = await getAPI();
      console.log('🔄 REDUX: Got booking API instance');
      
      const response = await bookingAPI.getUserBookings();
      console.log('🔄 REDUX: getUserBookings response:', response);
      console.log('🔄 REDUX: Bookings data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ REDUX: fetchUserBookings error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Enhanced createBooking with logging
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    console.log('🔄 REDUX: createBooking action called with data:', bookingData);
    
    try {
      const bookingAPI = await getAPI();
      console.log('🔄 REDUX: Got booking API instance');
      
      const response = await bookingAPI.createBooking(bookingData);
      console.log('🔄 REDUX: createBooking response:', response);
      
      return response.data;
    } catch (error) {
      console.error('❌ REDUX: createBooking error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);`;

// Enhanced BookingScreen with logging
const enhancedBookingScreenUseEffect = `
  // Enhanced useEffect with logging
  useEffect(() => {
    console.log('📱 BOOKING_SCREEN: Component mounted, fetching user bookings...');
    dispatch(fetchUserBookings());
  }, [dispatch]);

  // Enhanced useFocusEffect with logging
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 BOOKING_SCREEN: Screen focused, refreshing bookings...');
      dispatch(fetchUserBookings());
    }, [dispatch])
  );

  // Enhanced onRefresh with logging
  const onRefresh = async () => {
    console.log('📱 BOOKING_SCREEN: Pull-to-refresh triggered');
    setRefreshing(true);
    await dispatch(fetchUserBookings());
    setRefreshing(false);
    console.log('📱 BOOKING_SCREEN: Pull-to-refresh completed');
  };

  // Enhanced filtering with logging
  const filteredBookings = React.useMemo(() => {
    console.log('📱 BOOKING_SCREEN: Filtering bookings...', {
      totalBookings: userBookings.length,
      selectedTab,
      searchQuery
    });
    
    const filtered = filterBookings(userBookings, selectedTab);
    console.log('📱 BOOKING_SCREEN: Filtered bookings:', {
      filteredCount: filtered.length,
      bookings: filtered.map(b => ({ id: b.id, turfName: b.turfName, dateTime: b.dateTime }))
    });
    
    return filtered;
  }, [userBookings, selectedTab, searchQuery]);`;

console.log('\n✅ Debug logging enhancements prepared!');
console.log('\n📝 To implement these fixes:');
console.log('1. Add the enhanced logging to firebaseAPI.js');
console.log('2. Add the enhanced logging to bookingSlice.js');
console.log('3. Add the enhanced logging to BookingScreen.js');
console.log('4. Test booking creation and check console logs');
console.log('5. Check Firebase console for booking documents');

console.log('\n🔍 After implementing, you should see detailed logs for:');
console.log('• Booking creation process');
console.log('• Venue data fetching');
console.log('• Data enrichment');
console.log('• Firestore document creation');
console.log('• Booking retrieval process');
console.log('• Redux state updates');
console.log('• Component rendering');

console.log('\n🚨 This will help identify exactly where the process is failing!');