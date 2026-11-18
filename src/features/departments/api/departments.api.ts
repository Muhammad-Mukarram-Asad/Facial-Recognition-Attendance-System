import { apiClient } from '@/shared/api/client';

import type { Department } from '../types';

const DEPARTMENTS_API_URL = "/departments";

interface DepartmentsResponse {
  success: boolean;
  message: string;
  data: { departments: Department[] };
}

interface DepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
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

  // POST /api/v1/departments — only `name` is required; `code` and
  // `is_active` (default true) are left to the backend.
  create: async (name: string): Promise<Department> => {
    const { data } = await apiClient.post<DepartmentResponse>(DEPARTMENTS_API_URL, { name });
    return data.data;
  },
};
