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
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['_persist'],
      },
    }),
});