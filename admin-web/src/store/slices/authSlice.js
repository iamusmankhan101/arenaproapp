import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Use mock data for admin authentication (since we're using Firebase for main data)
const USE_MOCK_AUTH = true;

// Mock admin credentials and data
const mockAdminCredentials = {
  'admin@pitchit.com': 'admin123',
  'manager@pitchit.com': 'manager123'
};

const mockAdminData = {
  'admin@pitchit.com': {
    id: 'admin1',
    email: 'admin@pitchit.com',
    name: 'Admin User',
    role: 'super_admin',
    permissions: ['all'],
    lastLogin: new Date().toISOString(),
  },
  'manager@pitchit.com': {
    id: 'manager1',
    email: 'manager@pitchit.com',
    name: 'Manager User',
    role: 'manager',
    permissions: ['venues', 'bookings', 'customers'],
    lastLogin: new Date().toISOString(),
  }
};

const mockAuthAPI = {
  login: async (credentials) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { email, password } = credentials;
    
    // Check credentials
    if (mockAdminCredentials[email] === password) {
      const admin = mockAdminData[email];
      const token = `mock-jwt-token-${Date.now()}`;
      
      return {
        token,
        admin: {
          ...admin,
          lastLogin: new Date().toISOString()
        }
      };
    } else {
      throw new Error('Invalid email or password');
    }
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  refreshToken: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      return {
        token: `refreshed-${Date.now()}`,
        admin: JSON.parse(adminData)
      };
    } else {
      throw new Error('No valid session found');
    }
  }
};

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting admin login with mock auth');
      const response = await mockAuthAPI.login(credentials);
      
      // Store in localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminData', JSON.stringify(response.admin));
      
      console.log('✅ Admin login successful');
      return response.admin;
    } catch (error) {
      console.error('❌ Admin login failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await mockAuthAPI.logout();
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      console.log('✅ Admin logout successful');
      return null;
    } catch (error) {
      // Even if logout fails, clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return null;
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (token && adminData) {
        console.log('🔄 Loading stored admin auth');
        return JSON.parse(adminData);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to load stored auth:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshAuthToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockAuthAPI.refreshToken();
      localStorage.setItem('adminToken', response.token);
      return response.admin;
    } catch (error) {
      // If refresh fails, logout user
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: false,
  admin: null,
  loading: false,
  error: null,
  initializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticating: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.admin = null;
      })
      
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.admin = null;
        state.loading = false;
        state.error = null;
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.initializing = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.admin = action.payload;
        } else {
          state.isAuthenticated = false;
          state.admin = null;
        }
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.initializing = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.error = action.payload;
      })
      
      // Refresh token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.admin = action.payload;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.admin = null;
      });
  },
});

export const { clearError, setAuthenticating } = authSlice.actions;
export default authSlice.reducer;