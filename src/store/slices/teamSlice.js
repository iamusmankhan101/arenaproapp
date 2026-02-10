import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { challengeService } from '../../services/challengeService';

export const fetchChallenges = createAsyncThunk(
  'team/fetchChallenges',
  async (sport, { rejectWithValue }) => {
    try {
      const challenges = await challengeService.getOpenChallenges(sport === 'All Sports' ? null : sport);
      return challenges;
    } catch (error) {
      console.warn('Failed to fetch challenges:', error.message);
      return [];
    }
  }
);

export const createChallenge = createAsyncThunk(
  'team/createChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const result = await challengeService.createChallenge(challengeData);
      if (result.success) {
        return { id: result.id, ...challengeData };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptChallenge = createAsyncThunk(
  'team/acceptChallenge',
  async ({ challengeId, opponentId, opponentTeamName }, { rejectWithValue }) => {
    try {
      const result = await challengeService.acceptChallenge(challengeId, opponentId, opponentTeamName);
      if (result.success) {
        return { id: challengeId, status: 'matched', opponentId, opponentTeamName };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinTournament = createAsyncThunk(
  'team/joinTournament',
  async ({ challengeId, teamId, teamProfile }, { rejectWithValue }) => {
    try {
      const result = await challengeService.joinTournament(challengeId, teamId, teamProfile);
      if (result.success) {
        return { id: challengeId, teamId, teamProfile };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChallenge = createAsyncThunk(
  'team/deleteChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      const result = await challengeService.deleteChallenge(challengeId);
      if (result.success) {
        return challengeId;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
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
          state.challenges[index] = { ...state.challenges[index], ...action.payload };
        }
      })
      .addCase(deleteChallenge.fulfilled, (state, action) => {
        state.challenges = state.challenges.filter(c => c.id !== action.payload);
      });
  },
});

export const { setUserTeam, updateTeamStats, clearError } = teamSlice.actions;
export default teamSlice.reducer;