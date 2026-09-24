import { apiClient } from '@/shared/api/client';

import type { Designation } from '../types';

/** Same "explicit absolute URL, bypass the mock baseURL" pattern as
 * EMPLOYEES_API_URL/DEPARTMENTS_API_URL. */
const DESIGNATIONS_API_URL =
  process.env.NEXT_PUBLIC_DESIGNATIONS_API_URL ??
  'http://localhost:8000/api/v1/designations';

interface DesignationsResponse {
  success: boolean;
  message: string;
  data: { designations: Designation[] };
}

export const designationsApi = {
  // GET /api/v1/designations/full — requires auth, so this is only ever
  // called once a session exists (see authSlice/designationsSlice).
  list: async (): Promise<Designation[]> => {
    const { data } = await apiClient.get<DesignationsResponse>(
      `${DESIGNATIONS_API_URL}/full`,
      { params: { include_deleted: false } },
    );
    return data.data.designations;
  },
};
