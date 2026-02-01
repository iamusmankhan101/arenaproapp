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
    try {
      const bookingAPI = await getAPI();
      const response = await bookingAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const bookingAPI = await getAPI();
      const response = await bookingAPI.getUserBookings();
      return response.data;
    } catch (error) {
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
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Booking failed - slot may be taken';
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.userBookings = action.payload;
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