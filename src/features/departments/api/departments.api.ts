import { apiClient } from '@/shared/api/client';

import type { Department } from '../types';

/**
 * Same "explicit absolute URL, bypass the mock baseURL" pattern as
 * EMPLOYEES_API_URL/AUTH_API_URL.
 */
const DEPARTMENTS_API_URL =
  process.env.NEXT_PUBLIC_DEPARTMENTS_API_URL ??
  'http://localhost:8000/api/v1/departments';

interface DepartmentsResponse {
  success: boolean;
  message: string;
  data: { departments: Department[] };
}

export const departmentsApi = {
  // GET /api/v1/departments/full — requires auth, so this is only ever
  // called once a session exists (see authSlice/departmentsSlice).
  list: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<DepartmentsResponse>(
      `${DEPARTMENTS_API_URL}/full`,
      { params: { include_deleted: false } },
    );
    return data.data.departments;
  },
};
