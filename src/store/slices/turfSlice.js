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

export const searchTurfs = createAsyncThunk(
  'turf/search',
  async ({ query, sports }, { rejectWithValue }) => {
    try {
      console.log('🔍 turfSlice: Executing searchTurfs thunk with query:', query);
      const turfAPI = await getAPI();
      const response = await turfAPI.searchTurfs(query, sports);
      console.log(`✅ turfSlice: searchTurfs response received, ${response.data.length} venues found`);
      return response.data;
    } catch (error) {
      console.error('❌ turfSlice: searchTurfs thunk error:', error.message);
      return [];
    }
  }
);

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
      // Validate turfData.id before proceeding
      if (!turfData || !turfData.id) {
        console.error('❌ toggleFavorite thunk: Invalid turfData or turfData.id:', turfData);
        return rejectWithValue('Invalid venue data: missing ID');
      }

      console.log(`🔄 toggleFavorite thunk: Calling API for venue ${turfData.id}`);

      const turfAPI = await getAPI();
      const response = await turfAPI.toggleFavorite(turfData.id);
      return { turfData, isFavorite: response.data.isFavorite };
    } catch (error) {
      console.error('❌ toggleFavorite thunk error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'turf/fetchFavorites',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.user?.uid;
      const turfAPI = await getAPI();
      const response = await turfAPI.getFavorites(userId);
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
      priceRange: [0, 10000],
      sortBy: 'All', // 'All', 'Popular', 'Near by', 'Price Low to High'
      minRating: 0,
      sports: ['All'], // 'All', 'Cricket', 'Futsal', 'Padel'
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
      .addCase(searchTurfs.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchTurfs.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyTurfs = action.payload;
      })
      .addCase(fetchTurfDetails.fulfilled, (state, action) => {
        state.selectedTurf = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { turfData, isFavorite } = action.payload;

        // Update favorites array
        if (isFavorite) {
          const exists = state.favorites.find(fav => fav.id === turfData.id);
          if (!exists) {
            state.favorites.push(turfData);
          }
        } else {
          state.favorites = state.favorites.filter(fav => fav.id !== turfData.id);
        }

        // Update isFavorite in nearbyTurfs array
        const venueIndex = state.nearbyTurfs.findIndex(v => v.id === turfData.id);
        if (venueIndex !== -1) {
          state.nearbyTurfs[venueIndex].isFavorite = isFavorite;
        }

        // Update selectedTurf if it's the same venue
        if (state.selectedTurf?.id === turfData.id) {
          state.selectedTurf.isFavorite = isFavorite;
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