import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminAPI from '../../services/workingFirebaseAPI';

// Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await adminAPI.getDashboardStats();
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
      return await adminAPI.getBookings(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'admin/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, status);
      return { bookingId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'admin/cancelBooking',
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, 'cancelled');
      return { bookingId, status: 'cancelled' };
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
      return await adminAPI.getVenues(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVenueStatus = createAsyncThunk(
  'admin/updateVenueStatus',
  async ({ venueId, status }, { rejectWithValue }) => {
    try {
      await adminAPI.updateVenueStatus(venueId, status);
      return { venueId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addVenue = createAsyncThunk(
  'admin/addVenue',
  async (venueData, { rejectWithValue }) => {
    try {
      return await adminAPI.addVenue(venueData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVenue = createAsyncThunk(
  'admin/updateVenue',
  async ({ venueId, venueData }, { rejectWithValue }) => {
    try {
      return await adminAPI.updateVenue(venueId, venueData);
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
      return await adminAPI.getCustomers(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  'admin/updateCustomerStatus',
  async ({ customerId, status }, { rejectWithValue }) => {
    try {
      await adminAPI.updateCustomerStatus(customerId, status);
      return { customerId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reports
export const fetchRevenueReport = createAsyncThunk(
  'admin/fetchRevenueReport',
  async (params, { rejectWithValue }) => {
    try {
      return await adminAPI.getRevenueReport(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBookingReport = createAsyncThunk(
  'admin/fetchBookingReport',
  async (params, { rejectWithValue }) => {
    try {
      return await adminAPI.getBookingReport(params);
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
    weeklyStats: [],
  },
  
  // Bookings
  bookings: {
    data: [],
    total: 0,
    page: 0,
    pageSize: 25,
  },
  bookingsLoading: false,
  bookingsError: null,
  
  // Venues
  venues: {
    data: [],
    total: 0,
    page: 0,
    pageSize: 25,
  },
  venuesLoading: false,
  venuesError: null,
  
  // Customers
  customers: {
    data: [],
    total: 0,
    page: 0,
    pageSize: 25,
  },
  customersLoading: false,
  customersError: null,
  
  // Reports
  revenueReport: null,
  bookingReport: null,
  reportsLoading: false,
  reportsError: null,
  
  // General
  loading: false,
  error: null,
  successMessage: null,
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
      state.reportsError = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setBookingsPagination: (state, action) => {
      state.bookings.page = action.payload.page;
      state.bookings.pageSize = action.payload.pageSize;
    },
    setVenuesPagination: (state, action) => {
      state.venues.page = action.payload.page;
      state.venues.pageSize = action.payload.pageSize;
    },
    setCustomersPagination: (state, action) => {
      state.customers.page = action.payload.page;
      state.customers.pageSize = action.payload.pageSize;
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
        const booking = state.bookings.data.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
        }
        state.successMessage = 'Booking status updated successfully';
      })
      
      // Cancel Booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.data.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
        }
        state.successMessage = 'Booking cancelled successfully';
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
        const venue = state.venues.data.find(v => v.id === venueId);
        if (venue) {
          venue.status = status;
        }
        state.successMessage = 'Venue status updated successfully';
      })
      
      // Add Venue
      .addCase(addVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVenue.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new venue to the beginning of the venues list
        if (action.payload.data) {
          state.venues.data.unshift(action.payload.data);
          state.venues.total += 1;
        }
        state.successMessage = 'Venue added successfully! It will appear in the mobile app immediately.';
      })
      .addCase(addVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Venue
      .addCase(updateVenue.fulfilled, (state, action) => {
        const index = state.venues.data.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.venues.data[index] = action.payload;
        }
        state.successMessage = 'Venue updated successfully';
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
        const customer = state.customers.data.find(c => c.id === customerId);
        if (customer) {
          customer.status = status;
        }
        state.successMessage = 'Customer status updated successfully';
      })
      
      // Reports
      .addCase(fetchRevenueReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.revenueReport = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      .addCase(fetchBookingReport.fulfilled, (state, action) => {
        state.bookingReport = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage,
  setBookingsPagination,
  setVenuesPagination,
  setCustomersPagination,
} = adminSlice.actions;

export default adminSlice.reducer;