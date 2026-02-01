import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamAPI } from '../../services/api';

export const fetchChallenges = createAsyncThunk(
  'team/fetchChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamAPI.getChallenges();
      return response.data;
    } catch (error) {
      // Return empty array if API fails, don't show error to user
      console.warn('Failed to fetch challenges, using empty array:', error.message);
      return [];
    }
  }
);

export const createChallenge = createAsyncThunk(
  'team/createChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await teamAPI.createChallenge(challengeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const acceptChallenge = createAsyncThunk(
  'team/acceptChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await teamAPI.acceptChallenge(challengeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    userTeam: null,
    challenges: [],
    teamStats: {
      wins: 0,
      losses: 0,
      fairPlayScore: 5.0,
      eloRating: 1200,
    },
    loading: false,
    error: null,
  },
  reducers: {
    setUserTeam: (state, action) => {
      state.userTeam = action.payload;
    },
    updateTeamStats: (state, action) => {
      state.teamStats = { ...state.teamStats, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.challenges = action.payload;
      })
      .addCase(createChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges.unshift(action.payload);
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create challenge';
      })
      .addCase(acceptChallenge.fulfilled, (state, action) => {
        const index = state.challenges.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.challenges[index] = action.payload;
        }
      });
  },
});

export const { setUserTeam, updateTeamStats, clearError } = teamSlice.actions;
export default teamSlice.reducer;