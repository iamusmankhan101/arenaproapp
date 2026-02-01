import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shouldBypassAuth, getMockCredentials } from '../../config/devConfig';

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.signIn(phoneNumber, password);
      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Sign in failed' });
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ phoneNumber, password, fullName }, { rejectWithValue }) => {
    try {
      const response = await authAPI.signUp(phoneNumber, password, fullName);
      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Sign up failed' });
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (googleToken, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleSignIn(googleToken);
      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Google sign in failed' });
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendOTP(phoneNumber);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send OTP' });
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phoneNumber, otp, password, fullName, isSignup }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP(phoneNumber, otp, password, fullName, isSignup);
      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Invalid OTP' });
    }
  }
);

export const devBypassAuth = createAsyncThunk(
  'auth/devBypassAuth',
  async (_, { rejectWithValue }) => {
    try {
      if (!__DEV__) {
        return rejectWithValue({ message: 'Development bypass only available in dev mode' });
      }
      
      const mockCredentials = getMockCredentials();
      // Store mock credentials
      await AsyncStorage.setItem('authToken', mockCredentials.token);
      await AsyncStorage.setItem('user', JSON.stringify(mockCredentials.user));
      return mockCredentials;
    } catch (error) {
      return rejectWithValue({ message: 'Failed to bypass authentication' });
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we should bypass auth in development
      if (shouldBypassAuth()) {
        const mockCredentials = getMockCredentials();
        // Store mock credentials
        await AsyncStorage.setItem('authToken', mockCredentials.token);
        await AsyncStorage.setItem('user', JSON.stringify(mockCredentials.user));
        return mockCredentials;
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const userString = await AsyncStorage.getItem('user');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        // Verify token is still valid
        const response = await authAPI.verifyToken(token);
        return { token, user: response.data.user };
      }
      return null;
    } catch (error) {
      // Clear invalid stored data
      await AsyncStorage.multiRemove(['authToken', 'user']);
      return rejectWithValue({ message: 'Invalid stored authentication' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    otpSent: false,
    initializing: true,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      // Clear AsyncStorage
      AsyncStorage.multiRemove(['authToken', 'user']);
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.initializing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Development Bypass
      .addCase(devBypassAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(devBypassAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(devBypassAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Development bypass failed';
        state.initializing = false;
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Sign in failed';
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Sign up failed';
      })
      // Google Sign In
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Google sign in failed';
      })
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send OTP';
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpSent = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Invalid OTP';
      })
      // Load Stored Auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.initializing = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;