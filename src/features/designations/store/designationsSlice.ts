import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { toApiError } from '@/shared/api/client';
import type { RootState } from '@/shared/store/store';

import { designationsApi } from '../api/designations.api';
import type { Designation } from '../types';

/**
 * Fetches the full designation list once per session (requires auth, so
 * it's dispatched after sign-in / session rehydration — see authSlice and
 * StoreProvider). `condition` makes repeated dispatches no-ops once a
 * fetch has started or succeeded, so it only calls the API once — unless
 * `force` is passed (after creating a designation), which always refetches.
 */
export const fetchDesignations = createAsyncThunk<
  Designation[],
  { force?: boolean } | void,
  { state: RootState }
>(
  'designations/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await designationsApi.list();
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { status } = getState().designations;
      return status !== 'loading' && status !== 'succeeded';
    },
  },
);

/**
 * POST /api/v1/designations with just a name, then refetches the full list so
 * the store (and every dropdown reading it) includes the new designation.
 * Resolves with the created designation.
 */
export const createDesignation = createAsyncThunk<Designation, string, { state: RootState }>(
  'designations/create',
  async (name, { dispatch, rejectWithValue }) => {
    try {
      const created = await designationsApi.create(name);
      await dispatch(fetchDesignations({ force: true }));
      return created;
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
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
      .addCase(createDesignation.fulfilled, (state, action) => {
        // The refetch normally already includes it; this covers a refetch
        // that failed after the create itself succeeded.
        const created = action.payload;
        if (created && !state.items.some((item) => item.id === created.id)) {
          state.items.push(created);
        }
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load designations';
      });
  },
});

export const designationsReducer = designationsSlice.reducer;
