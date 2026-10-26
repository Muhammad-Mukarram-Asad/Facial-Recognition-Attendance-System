import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toApiError } from "@/shared/api/client";
import type { RootState } from "@/shared/store/store";

import { shiftsApi } from "../api/shifts.api";
import type { ShiftType } from "../types";

/**
 * Fetches the full shift list once per session (requires auth, so
 * it's dispatched after sign-in / session rehydration — see authSlice and
 * StoreProvider). `condition` makes repeated dispatches no-ops once a
 * fetch has started or succeeded, so it truly only ever calls the API once.
 */

export const fetchShifts = createAsyncThunk<ShiftType[], void, { state: RootState }>(
  'shifts/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await shiftsApi.list();
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().shifts;
      return status !== 'loading' && status !== 'succeeded';
    },
  }
);

interface ShiftsState {
    items: ShiftType[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }
  
  const initialState: ShiftsState = {
    items: [],
    status: 'idle',
    error: null,
  };

  const shiftsSlice = createSlice({
    name: 'shifts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchShifts.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(fetchShifts.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload;
        })
        .addCase(fetchShifts.rejected, (state, action) => {
          state.status = 'failed';
          state.error = (action.payload as string) ?? action.error.message ?? 'Failed to load shifts';
        });
    },
  });

export const shiftsReducer = shiftsSlice.reducer;   