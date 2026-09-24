import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { toApiError } from '@/shared/api/client';
import type { RootState } from '@/shared/store/store';

import { departmentsApi } from '../api/departments.api';
import type { Department } from '../types';

/**
 * Fetches the full department list once per session (requires auth, so
 * it's dispatched after sign-in / session rehydration — see authSlice and
 * StoreProvider). `condition` makes repeated dispatches no-ops once a
 * fetch has started or succeeded, so it truly only ever calls the API once.
 */
export const fetchDepartments = createAsyncThunk<Department[], void, { state: RootState }>(
  'departments/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await departmentsApi.list();
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().departments;
      return status !== 'loading' && status !== 'succeeded';
    },
  },
);

interface DepartmentsState {
  items: Department[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DepartmentsState = {
  items: [],
  status: 'idle',
  error: null,
};

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load departments';
      });
  },
});

export const departmentsReducer = departmentsSlice.reducer;
