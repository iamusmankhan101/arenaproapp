import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { firebaseAuthAPI } from '../../services/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shouldBypassAuth, getMockCredentials } from '../../config/devConfig';

// Enhanced async thunks for Firebase authentication
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔍 REDUX DEBUG: signIn thunk called with:', { email, passwordLength: password.length });
      const response = await firebaseAuthAPI.signIn(email, password);
      console.log('🔍 REDUX DEBUG: firebaseAuthAPI.signIn response:', response);
      return response.data;
    } catch (error) {
      console.log('🔍 REDUX DEBUG: signIn thunk error:', error);
      console.log('🔍 REDUX DEBUG: Error message:', error.message);
      console.log('🔍 REDUX DEBUG: Error code:', error.code);
      return rejectWithValue({ message: error.message });
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName, phoneNumber, city, referralCode }, { rejectWithValue }) => {
    try {
      const response = await firebaseAuthAPI.signUp(email, password, fullName, phoneNumber, city, referralCode);
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (googleToken, { rejectWithValue }) => {
    try {
      const response = await firebaseAuthAPI.googleSignIn(googleToken);
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await firebaseAuthAPI.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await firebaseAuthAPI.updateProfile(userData);
      return { ...response.data, userData };
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await firebaseAuthAPI.changePassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

export const resendEmailVerification = createAsyncThunk(
  'auth/resendEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await firebaseAuthAPI.resendEmailVerification();
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
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
        await AsyncStorage.setItem('authToken', mockCredentials.token);
        await AsyncStorage.setItem('user', JSON.stringify(mockCredentials.user));
        return mockCredentials;
      }

      const token = await AsyncStorage.getItem('authToken');
      const userString = await AsyncStorage.getItem('user');

      if (token && userString) {
        const user = JSON.parse(userString);
        try {
          // Verify token is still valid
          const response = await firebaseAuthAPI.verifyToken(token);
          if (response.data) {
            return { token: response.data.token, user: response.data.user };
          } else {
            // Token verification returned null (no authenticated user)
            await AsyncStorage.multiRemove(['authToken', 'user']);
            return null;
          }
        } catch (error) {
          // Token is invalid, clear storage
          await AsyncStorage.multiRemove(['authToken', 'user']);
          return null;
        }
      }
      return null;
    } catch (error) {
      // Clear invalid stored data
      await AsyncStorage.multiRemove(['authToken', 'user']);
      return null; // Don't reject, just return null for no auth
    }
  }
);

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      if (!user?.uid) {
        return rejectWithValue({ message: 'No user ID found' });
      }

      const response = await firebaseAuthAPI.getUserProfile(user.uid);
      return response.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Initialize auth state listener
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Set up Firebase auth state listener
      const unsubscribe = firebaseAuthAPI.initializeAuthListener((authData) => {
        if (authData.user) {
          dispatch(setAuthData({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true
          }));
        } else {
          dispatch(clearAuth());
        }
        dispatch(setInitialized());
      });

      // Store unsubscribe function outside Redux state
      if (typeof window !== 'undefined') {
        window.__authUnsubscribe = unsubscribe;
      } else if (typeof global !== 'undefined') {
        global.__authUnsubscribe = unsubscribe;
      }

      return { success: true };
    } catch (error) {
      return rejectWithValue({ message: 'Failed to initialize authentication' });
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
    initializing: true,
    emailVerificationSent: false,
    passwordResetSent: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.emailVerificationSent = false;
      state.passwordResetSent = false;
      // Clear AsyncStorage
      AsyncStorage.multiRemove(['authToken', 'user']);
      // Sign out from Firebase
      firebaseAuthAPI.signOut();
      // Clean up auth listener
      if (typeof window !== 'undefined' && window.__authUnsubscribe) {
        window.__authUnsubscribe();
        window.__authUnsubscribe = null;
      } else if (typeof global !== 'undefined' && global.__authUnsubscribe) {
        global.__authUnsubscribe();
        global.__authUnsubscribe = null;
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.emailVerificationSent = false;
      state.passwordResetSent = false;
    },
    setAuthData: (state, action) => {
      console.log('🔍 REDUX DEBUG: setAuthData called with:', action.payload);
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.loading = false;
      state.error = null;
      console.log('🔍 REDUX DEBUG: setAuthData - isAuthenticated set to:', state.isAuthenticated);
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.initializing = false;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.initializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        // Auth listener is now stored outside Redux state
        state.initializing = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.initializing = false;
        state.error = action.payload?.message || 'Failed to initialize authentication';
      })
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
        console.log('🔍 REDUX DEBUG: signIn.fulfilled triggered');
        console.log('🔍 REDUX DEBUG: Payload:', action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log('🔍 REDUX DEBUG: Updated state - isAuthenticated:', state.isAuthenticated);
        console.log('🔍 REDUX DEBUG: Updated state - hasUser:', !!state.user);
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
        state.emailVerificationSent = true;
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
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send password reset email';
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && action.payload.userData) {
          state.user = { ...state.user, ...action.payload.userData };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to change password';
      })
      // Resend Email Verification
      .addCase(resendEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendEmailVerification.fulfilled, (state) => {
        state.loading = false;
        state.emailVerificationSent = true;
      })
      .addCase(resendEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send verification email';
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
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        // We don't want to show a big error if background fetch fails, just log it
        console.log('Background profile fetch failed:', action.payload?.message);
      });
  },
});

export const {
  logout,
  clearAuth,
  setAuthData,
  clearError,
  setInitialized,
  updateUserData
} = authSlice.actions;

export default authSlice.reducer;