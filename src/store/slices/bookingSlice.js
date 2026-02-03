import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAPIConfig } from '../../config/backendConfig';

// Dynamic API import based on backend configuration
const getAPI = async () => {
  const config = getAPIConfig();
  if (config.useFirebaseAPI) {
    const { bookingAPI } = await import('../../services/firebaseAPI');
    return bookingAPI;
  } else {
    const { bookingAPI } = await import('../../services/api');
    return bookingAPI;
  }
};

export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchSlots',
  async ({ turfId, date }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Redux: Fetching available slots for ${turfId} on ${date}`);
      const bookingAPI = await getAPI();
      const response = await bookingAPI.getAvailableSlots(turfId, date);
      console.log(`✅ Redux: Successfully fetched ${response.data.length} slots`);
      return response.data;
    } catch (error) {
      console.error('❌ Redux: Error fetching slots:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    console.log('🔄 REDUX: createBooking action called with data:', bookingData);
    
    try {
      // Validate booking data before processing
      if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
        throw new Error('Missing required booking data: date, startTime, or endTime');
      }
      
      // Extract date part if it's an ISO string, otherwise use as-is
      let dateString = bookingData.date;
      if (typeof dateString === 'string' && dateString.includes('T')) {
        // If it's an ISO timestamp, extract just the date part
        dateString = dateString.split('T')[0];
        console.log('🔄 REDUX: Extracted date from ISO string:', dateString);
      }
      
      // Validate date format
      const testDate = new Date(dateString);
      if (isNaN(testDate.getTime())) {
        throw new Error('Invalid date format in booking data');
      }
      
      // Validate time formats
      const testStartTime = new Date(`2000-01-01T${bookingData.startTime}:00`);
      const testEndTime = new Date(`2000-01-01T${bookingData.endTime}:00`);
      if (isNaN(testStartTime.getTime()) || isNaN(testEndTime.getTime())) {
        throw new Error('Invalid time format in booking data');
      }
      
      // Test the final dateTime creation
      const testDateTime = new Date(`${dateString}T${bookingData.startTime}:00`);
      if (isNaN(testDateTime.getTime())) {
        throw new Error('Invalid date/time combination in booking data');
      }
      
      console.log('🔄 REDUX: All validations passed for booking data');
      
      const bookingAPI = await getAPI();
      console.log('🔄 REDUX: Got booking API instance for createBooking');
      
      const response = await bookingAPI.createBooking(bookingData);
      console.log('🔄 REDUX: createBooking response:', response);
      
      return response.data;
    } catch (error) {
      console.error('❌ REDUX: createBooking error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    console.log('🔄 REDUX: fetchUserBookings action called');
    
    try {
      const bookingAPI = await getAPI();
      console.log('🔄 REDUX: Got booking API instance');
      
      const response = await bookingAPI.getUserBookings();
      console.log('🔄 REDUX: getUserBookings response:', response);
      console.log('🔄 REDUX: Bookings data count:', response.data.length);
      
      return response.data;
    } catch (error) {
      console.error('❌ REDUX: fetchUserBookings error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    availableSlots: [],
    userBookings: [],
    currentBooking: null,
    loading: false,
    error: null,
    selectedSlot: null,
    selectedDate: new Date().toISOString().split('T')[0],
  },
  reducers: {
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.selectedSlot = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAvailableSlots: (state) => {
      console.log('🧹 Redux: Clearing available slots');
      state.availableSlots = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch slots';
      })
      .addCase(createBooking.pending, (state) => {
        console.log('🔄 REDUX: createBooking.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        console.log('🔄 REDUX: createBooking.fulfilled with payload:', action.payload);
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        console.log('❌ REDUX: createBooking.rejected with error:', action.payload);
        state.loading = false;
        state.error = action.payload?.message || 'Booking failed - slot may be taken';
      })
      .addCase(fetchUserBookings.pending, (state) => {
        console.log('🔄 REDUX: fetchUserBookings.pending');
        state.loading = true;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        console.log('🔄 REDUX: fetchUserBookings.fulfilled with bookings:', action.payload.length);
        state.loading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        console.log('❌ REDUX: fetchUserBookings.rejected with error:', action.payload);
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bookings';
      });
  },
});

export const { 
  setSelectedSlot, 
  setSelectedDate, 
  clearCurrentBooking, 
  clearError,
  clearAvailableSlots
} = bookingSlice.actions;
export default bookingSlice.reducer;