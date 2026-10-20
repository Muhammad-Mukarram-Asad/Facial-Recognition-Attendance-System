import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { isUnauthorized, toApiError } from '@/shared/api/client';
import { getAuthToken } from '@/shared/lib/auth-token';

import { authApi } from '../api/auth.api';
import { endAuthSession, readSavedSessionUser, updateSavedSessionUser } from '../lib/saved-session';
import type { AuthUser } from '../types';

/**
 * Rehydrates the signed-in user on app load — see StoreProvider.
 * A network failure keeps the cached profile for the rest of the hour.
 * An expired or invalid token ends the session instead.
 */
export const fetchCurrentUser = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    if (!getAuthToken()) {
      endAuthSession();
      return rejectWithValue('No session');
    }
    try {
      const user = await authApi.me();
      updateSavedSessionUser(user);
      return user;
    } catch (error) {
      if (isUnauthorized(error)) {
        endAuthSession();
        return rejectWithValue(toApiError(error).message);
      }
      const cached = readSavedSessionUser();
      if (cached) return cached;
      endAuthSession();
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
