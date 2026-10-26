import { apiClient } from '@/shared/api/client';

import type { ShiftType } from '../types';

const SHIFTS_API_URL = "/shifts";

interface ShiftsResponse {
  success: boolean;
  message: string;
  data: { shifts: ShiftType[] };
}

export const shiftsApi = {
  // GET /api/v1/shifts/full — requires auth, so this is only ever
  // called once a session exists (see authSlice/shiftsSlice).
  list: async (): Promise<ShiftType[]> => {
    const { data } = await apiClient.get<ShiftsResponse>(
      `${SHIFTS_API_URL}/full`,
      { params: { include_deleted: false, active_only: true } },
    );
    return data.data.shifts;
  },
};
