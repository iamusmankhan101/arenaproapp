import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchSlots',
  async ({ turfId, date }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getAvailableSlots(turfId, date);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getUserBookings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
  clearError 
} = bookingSlice.actions;
export default bookingSlice.reducer;