import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import turfSlice from './slices/turfSlice';
import bookingSlice from './slices/bookingSlice';
import teamSlice from './slices/teamSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    turf: turfSlice,
    booking: bookingSlice,
    team: teamSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'auth/initializeAuth/fulfilled',
          'auth/initializeAuth/pending',
          'auth/initializeAuth/rejected',
          'auth/signIn/fulfilled',
          'auth/signUp/fulfilled',
          'auth/googleSignIn/fulfilled',
          'auth/loadStoredAuth/fulfilled',
          'booking/create/pending',
          'booking/create/fulfilled',
          'booking/create/rejected'
        ],
        ignoredPaths: [
          '_persist',
          'auth.user.createdAt',
          'auth.user.updatedAt', 
          'auth.user.lastLoginAt',
          'booking.currentBooking.createdAt',
          'booking.currentBooking.dateTime',
          'booking.userBookings'
        ],
        // Don't check for non-serializable values in these action types
        ignoredActionPaths: [
          'payload.unsubscribe', 
          'meta.arg.unsubscribe',
          'payload.user.createdAt',
          'payload.user.updatedAt',
          'payload.user.lastLoginAt',
          'payload.createdAt',
          'payload.dateTime',
          'meta.arg.date',
          'meta.arg.startTime',
          'meta.arg.endTime'
        ],
        // Custom function to check if a value is serializable
        isSerializable: (value) => {
          // Allow ISO date strings
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return true;
          }
          // Allow valid Date objects by converting them to ISO strings
          if (value instanceof Date && !isNaN(value.getTime())) {
            return true;
          }
          // Reject Firebase serverTimestamp objects
          if (value && typeof value === 'object' && value._methodName === 'serverTimestamp') {
            return false;
          }
          // Reject invalid Date objects
          if (value instanceof Date && isNaN(value.getTime())) {
            console.error('❌ Redux: Invalid Date object detected:', value);
            return false;
          }
          return true;
        }
      },
    }),
});