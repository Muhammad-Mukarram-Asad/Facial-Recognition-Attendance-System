import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { toApiError } from '@/shared/api/client';
import type { RootState } from '@/shared/store/store';

import { departmentsApi } from '../api/departments.api';
import type { Department } from '../types';

/**
 * Fetches the full department list once per session (requires auth, so
 * it's dispatched after sign-in / session rehydration — see authSlice and
 * StoreProvider). `condition` makes repeated dispatches no-ops once a
 * fetch has started or succeeded, so it only calls the API once — unless
 * `force` is passed (after creating a department), which always refetches.
 */
export const fetchDepartments = createAsyncThunk<
  Department[],
  { force?: boolean } | void,
  { state: RootState }
>(
  'departments/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await departmentsApi.list();
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { status } = getState().departments;
      return status !== 'loading' && status !== 'succeeded';
    },
  },
);

/**
 * POST /api/v1/departments with just a name, then refetches the full list so
 * the store (and every dropdown reading it) includes the new department.
 * Resolves with the created department.
 */
export const createDepartment = createAsyncThunk<Department, string, { state: RootState }>(
  'departments/create',
  async (name, { dispatch, rejectWithValue }) => {
    try {
      const created = await departmentsApi.create(name);
      await dispatch(fetchDepartments({ force: true }));
      return created;
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
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
      .addCase(createDepartment.fulfilled, (state, action) => {
        // The refetch normally already includes it; this covers a refetch
        // that failed after the create itself succeeded.
        const created = action.payload;
        if (created && !state.items.some((item) => item.id === created.id)) {
          state.items.push(created);
        }
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load departments';
      });
  },
});

export const departmentsReducer = departmentsSlice.reducer;
