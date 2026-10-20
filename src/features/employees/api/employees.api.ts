import { apiClient } from "@/shared/api/client";

import {
  toEmployee,
  type Employee,
  type EmployeeList,
  type EmployeeQuery,
  type EmployeeWritePayload,
  type RealEmployeeRecord,
} from "../types";

const EMPLOYEES_API_URL = "/employees";

const SERVER_ASSETS_URL =
  process.env.NEXT_PUBLIC_SERVER_ASSETS?.replace(/\/$/, "") ?? "";

/**
 * Turn a stored enrollment key (`employees/{code}/...`) into a URL the
 * browser can load. Absolute URLs are returned as-is.
 */
export function employeePhotoUrl(
  photoPath: string | null | undefined,
): string | null {
  if (!photoPath || !SERVER_ASSETS_URL) return null;
  if (/^https?:\/\//i.test(photoPath)) return photoPath;
  return `${SERVER_ASSETS_URL}/${photoPath.replace(/^\//, "")}`;
}

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

  // GET /api/v1/employees/full — every employee, unfiltered. Search is
  // applied to a local copy of this list, not by this request.
  listAll: async (): Promise<EmployeeList> => {
    const { data } = await apiClient.get<EmployeesListResponse>(
      `${EMPLOYEES_API_URL}/full`,
    );
    const items = data.data.employees.map(toEmployee);
    return { items, total: data.data.total ?? items.length };
  },

  // GET /api/v1/employees/{id} — `id` is the integer primary key.
  detail: async (id: string): Promise<Employee> => {
    const { data } = await apiClient.get<EmployeeDetailResponse>(
      `${EMPLOYEES_API_URL}/${id}`,
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

  // PUT /api/v1/employees/{id} — plain JSON. `id` is the integer primary
  // key, both in the path and in the body. Doesn't re-send the photo.
  update: async (
    id: number,
    input: EmployeeWritePayload,
  ): Promise<Employee> => {
    if (!Number.isInteger(id)) {
      throw new Error("Employee id must be an integer");
    }
    const { data } = await apiClient.put<EmployeeDetailResponse>(
      `${EMPLOYEES_API_URL}/${id}`,
      { ...input, id },
    );
    return toEmployee(data.data);
  },

  // DELETE /api/v1/employees/{id} — `id` is the integer primary key.
  remove: async (id: string): Promise<void> => {
    const recordId = Number(id);
    if (!Number.isInteger(recordId)) {
      throw new Error("Employee id must be an integer");
    }
    await apiClient.delete(`${EMPLOYEES_API_URL}/${recordId}`);
  },
};
