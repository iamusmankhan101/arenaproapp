import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

// Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getDashboardStats();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Bookings
export const fetchBookings = createAsyncThunk(
  'admin/fetchBookings',
  async (params, { rejectWithValue }) => {
    try {
      return await adminApi.getBookings(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'admin/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      await adminApi.updateBookingStatus(bookingId, status);
      return { bookingId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Venues
export const fetchVenues = createAsyncThunk(
  'admin/fetchVenues',
  async (params, { rejectWithValue }) => {
    try {
      return await adminApi.getVenues(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVenueStatus = createAsyncThunk(
  'admin/updateVenueStatus',
  async ({ venueId, status }, { rejectWithValue }) => {
    try {
      await adminApi.updateVenueStatus(venueId, status);
      return { venueId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Customers
export const fetchCustomers = createAsyncThunk(
  'admin/fetchCustomers',
  async (params, { rejectWithValue }) => {
    try {
      return await adminApi.getCustomers(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  'admin/updateCustomerStatus',
  async ({ customerId, status }, { rejectWithValue }) => {
    try {
      await adminApi.updateCustomerStatus(customerId, status);
      return { customerId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Dashboard
  dashboardStats: {
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    activeVenues: 0,
    totalCustomers: 0,
    pendingBookings: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0,
  },
  
  // Bookings
  bookings: [],
  bookingsLoading: false,
  bookingsError: null,
  
  // Venues
  venues: [],
  venuesLoading: false,
  venuesError: null,
  
  // Customers
  customers: [],
  customersLoading: false,
  customersError: null,
  
  // General
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.bookingsError = null;
      state.venuesError = null;
      state.customersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.bookingsLoading = true;
        state.bookingsError = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.bookingsError = action.payload;
      })
      
      // Update Booking Status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
        }
      })
      
      // Venues
      .addCase(fetchVenues.pending, (state) => {
        state.venuesLoading = true;
        state.venuesError = null;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.venuesLoading = false;
        state.venues = action.payload;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.venuesLoading = false;
        state.venuesError = action.payload;
      })
      
      // Update Venue Status
      .addCase(updateVenueStatus.fulfilled, (state, action) => {
        const { venueId, status } = action.payload;
        const venue = state.venues.find(v => v.id === venueId);
        if (venue) {
          venue.status = status;
        }
      })
      
      // Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.customersLoading = true;
        state.customersError = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.customersError = action.payload;
      })
      
      // Update Customer Status
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        const { customerId, status } = action.payload;
        const customer = state.customers.find(c => c.id === customerId);
        if (customer) {
          customer.status = status;
        }
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;