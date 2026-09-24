import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { toApiError } from '@/shared/api/client';
import { clearAuthToken, getAuthToken } from '@/shared/lib/auth-token';

import { authApi } from '../api/auth.api';
import type { AuthUser } from '../types';

/** Rehydrates the signed-in user from the token cookie on app load — see
 * StoreProvider. Short-circuits (no request) if there's no token yet. */
export const fetchCurrentUser = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    if (!getAuthToken()) return rejectWithValue('No session');
    try {
      return await authApi.me();
    } catch (error) {
      // Stale/invalid token — drop it so the interceptor stops sending it.
      clearAuthToken();
      return rejectWithValue(toApiError(error).message);
    }
  },
);

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = 'succeeded';
    },
    clearUser(state) {
      state.user = null;
      state.status = 'failed';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
      });
  },
});

export const { addUser, clearUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
