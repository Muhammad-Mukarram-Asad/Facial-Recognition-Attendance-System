import { apiClient } from "@/shared/api/client";

import {
  toEmployee,
  type Employee,
  type EmployeeList,
  type EmployeeQuery,
  type EmployeeWritePayload,
  type RealEmployeeRecord,
} from "../types";

/**
 * The real backend's employee endpoints. Every call here is pinned to an
 * explicit, absolute URL so it hits the real FaceTrack backend directly —
 * bypassing apiClient's default baseURL (the in-app mock under /api) —
 * without needing NEXT_PUBLIC_API_BASE_URL to switch every other mocked
 * endpoint over with it.
 */
const EMPLOYEES_API_URL =
  process.env.NEXT_PUBLIC_EMPLOYEES_API_URL ??
  "http://localhost:8000/api/v1/employees";

interface EmployeesListResponse {
  success: boolean;
  message: string;
  data: {
    employees: RealEmployeeRecord[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface EmployeeDetailResponse {
  success: boolean;
  message: string;
  data: RealEmployeeRecord;
}

export const employeesApi = {
  // GET /api/v1/employees — paginated, with optional search. Confirmed
  // envelope: {success, message, data: {employees: [...]}}.
  list: async (query: EmployeeQuery = {}): Promise<EmployeeList> => {
    const { data } = await apiClient.get<EmployeesListResponse>(
      EMPLOYEES_API_URL,
      {
        params: {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          include_deleted: query.includeDeleted ?? false,
          search: query.search || undefined,
        },
      },
    );
    const items = data.data.employees.map(toEmployee);
    return { items, total: data.data.total ?? items.length };
  },

  // GET /api/v1/employees/{employee_id}
  detail: async (employeeId: string): Promise<Employee> => {
    const { data } = await apiClient.get<EmployeeDetailResponse>(
      `${EMPLOYEES_API_URL}/${employeeId}`,
    );
    return toEmployee(data.data);
  },

  /**
   * POST /api/v1/employees — multipart/form-data with the employee fields
   * as a JSON string (`employee_data`) plus the enrollment `photo`. The
   * response shape from the real backend isn't confirmed yet, so callers
   * refetch the list instead of trusting a parsed response body here.
   */
  create: async (input: EmployeeWritePayload, photo: File): Promise<void> => {
    const formData = new FormData();
    formData.append("employee_data", JSON.stringify(input));
    formData.append("photo", photo);
    // Let the browser set the multipart boundary itself — a manually
    // pinned Content-Type (even "multipart/form-data") drops the boundary
    // and the server can't parse the body.
    await apiClient.post(EMPLOYEES_API_URL, formData, {
      headers: { "Content-Type": undefined },
    });
  },

  // PUT /api/v1/employees/{employee_id} — plain JSON, same field shape as
  // create. Doesn't re-send the photo; there's no separate re-enrollment
  // endpoint wired up here yet.
  update: async (
    employeeId: string,
    input: EmployeeWritePayload,
  ): Promise<Employee> => {
    const { data } = await apiClient.put<EmployeeDetailResponse>(
      `${EMPLOYEES_API_URL}/${employeeId}`,
      input,
    );
    return toEmployee(data.data);
  },

  // DELETE /api/v1/employees/{employee_id}
  remove: async (employeeId: string): Promise<void> => {
    await apiClient.delete(`${EMPLOYEES_API_URL}/${employeeId}`);
  },
};
