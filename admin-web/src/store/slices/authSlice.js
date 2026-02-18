import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login with Firebase Auth...');
      const { email, password } = credentials;

      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch user details and role from Firestore
      console.log('👤 Fetching user profile for:', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User profile not found in database');
      }

      const userData = userDoc.data();
      const role = userData.role || 'guest';

      // 3. Check if user has permission to access admin/vendor portal
      if (role !== 'admin' && role !== 'vendor' && role !== 'super_admin') {
        await signOut(auth);
        throw new Error('Unauthorized access. Only Admins and Vendors can login here.');
      }

      const adminData = {
        uid: user.uid,
        email: user.email,
        name: userData.fullName || userData.displayName || userData.name || 'User',
        role: role,
        photoURL: userData.photoURL || null,
        vendorId: userData.vendorId || null, // If linked to a specific vendor profile
        permissions: role === 'admin' || role === 'super_admin' ? ['all'] : ['vendor_access'],
        lastLogin: new Date().toISOString(),
      };

      // Store in localStorage
      localStorage.setItem('adminToken', await user.getIdToken());
      localStorage.setItem('adminData', JSON.stringify(adminData));

      console.log(`✅ Login successful as ${role}`);
      return adminData;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      // Map Firebase error codes to user-friendly messages
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      console.log('✅ Logout successful');
      return null;
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Force local cleanup anyway
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
      const adminDataString = localStorage.getItem('adminData');

      if (token && adminDataString) {
        console.log('🔄 Loading stored session');
        const adminData = JSON.parse(adminDataString);
        return adminData;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load stored auth:', error.message);
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
      });
  },
});

export const { clearError, setAuthenticating } = authSlice.actions;
export default authSlice.reducer;
