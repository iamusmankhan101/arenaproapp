import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAPIConfig } from '../../config/backendConfig';

// Dynamic API import based on backend configuration
const getAPI = async () => {
  const config = getAPIConfig();
  if (config.useFirebaseAPI) {
    const { turfAPI } = await import('../../services/firebaseAPI');
    return turfAPI;
  } else {
    const { turfAPI } = await import('../../services/api');
    return turfAPI;
  }
};

export const fetchNearbyTurfs = createAsyncThunk(
  'turf/fetchAll',
  async ({ latitude, longitude, radius = 5 }, { rejectWithValue }) => {
    try {
      console.log('🚀 Mobile app: fetchAllTurfs called (no location filtering)');
      const turfAPI = await getAPI();
      const response = await turfAPI.getNearbyTurfs(latitude, longitude, radius);
      console.log('✅ Mobile app: fetchAllTurfs response:', response.data.length, 'venues');
      return response.data;
    } catch (error) {
      // Return empty array if API fails, don't show error to user
      console.warn('⚠️ Mobile app: Failed to fetch turfs, using empty array:', error.message);
      return [];
    }
  }
);

export const fetchTurfDetails = createAsyncThunk(
  'turf/fetchDetails',
  async (turfId, { rejectWithValue }) => {
    try {
      const turfAPI = await getAPI();
      const response = await turfAPI.getTurfDetails(turfId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'turf/toggleFavorite',
  async (turfData, { rejectWithValue }) => {
    try {
      const turfAPI = await getAPI();
      const response = await turfAPI.toggleFavorite(turfData.id);
      return { turfData, isFavorite: response.data.isFavorite };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'turf/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const turfAPI = await getAPI();
      const response = await turfAPI.getFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const turfSlice = createSlice({
  name: 'turf',
  initialState: {
    nearbyTurfs: [], // Now contains all active venues, not just nearby ones
    selectedTurf: null,
    favorites: [],
    loading: false,
    error: null,
    filters: {
      hasFloodlights: false,
      surfaceType: 'all', // 'astroturf', 'cement', 'all'
      hasGenerator: false,
      priceRange: [0, 5000],
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedTurf: (state) => {
      state.selectedTurf = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addToFavorites: (state, action) => {
      const turf = action.payload;
      const exists = state.favorites.find(fav => fav.id === turf.id);
      if (!exists) {
        state.favorites.push(turf);
      }
    },
    removeFromFavorites: (state, action) => {
      const turfId = action.payload;
      state.favorites = state.favorites.filter(fav => fav.id !== turfId);
    },
    setNearbyTurfs: (state, action) => {
      state.nearbyTurfs = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyTurfs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyTurfs.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyTurfs = action.payload;
      })
      .addCase(fetchNearbyTurfs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch turfs';
      })
      .addCase(fetchTurfDetails.fulfilled, (state, action) => {
        state.selectedTurf = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { turfData, isFavorite } = action.payload;
        if (isFavorite) {
          const exists = state.favorites.find(fav => fav.id === turfData.id);
          if (!exists) {
            state.favorites.push(turfData);
          }
        } else {
          state.favorites = state.favorites.filter(fav => fav.id !== turfData.id);
        }
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });
  },
});

export const { 
  setFilters, 
  clearSelectedTurf, 
  clearError, 
  addToFavorites, 
  removeFromFavorites,
  setNearbyTurfs
} = turfSlice.actions;
export default turfSlice.reducer;