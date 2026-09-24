import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { toApiError } from '@/shared/api/client';
import type { RootState } from '@/shared/store/store';

import { designationsApi } from '../api/designations.api';
import type { Designation } from '../types';

/**
 * Fetches the full designation list once per session (requires auth, so
 * it's dispatched after sign-in / session rehydration — see authSlice and
 * StoreProvider). `condition` makes repeated dispatches no-ops once a
 * fetch has started or succeeded, so it truly only ever calls the API once.
 */
export const fetchDesignations = createAsyncThunk<Designation[], void, { state: RootState }>(
  'designations/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await designationsApi.list();
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().designations;
      return status !== 'loading' && status !== 'succeeded';
    },
  },
);

interface DesignationsState {
  items: Designation[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DesignationsState = {
  items: [],
  status: 'idle',
  error: null,
};

const designationsSlice = createSlice({
  name: 'designations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load designations';
      });
  },
});

export const designationsReducer = designationsSlice.reducer;
