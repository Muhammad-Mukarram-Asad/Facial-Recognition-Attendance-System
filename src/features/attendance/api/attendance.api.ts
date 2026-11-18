import { apiClient, getValidated } from "@/shared/api/client";

import {
  attendanceRegisterSchema,
  type AttendanceRegister,
  type AttendanceStatus,
} from "../types";

/** Query for GET /api/v1/attendance/attendance-full. Omitted filters are not sent. */
export type AttendanceRegisterQuery = {
  timestamp: string;
  status?: AttendanceStatus;
  is_late?: boolean;
};

export const attendanceApi = {
  /**
   * GET /api/v1/attendance/attendance-full
   * Status, lateness, and early departure combine with AND.
   * Omit status for every row. Send is_late / is_early_departure only when true.
   */
  register: (query: AttendanceRegisterQuery): Promise<AttendanceRegister> => {
    const params: Record<string, string | boolean> = { timestamp: query.timestamp };
    if (query.status) params.status = query.status;
    if (query.is_late) params.is_late = true;

    return getValidated("/attendance/attendance-full", attendanceRegisterSchema, { params }).then(
      (response) => response.data,
    );
  },

  /**
   * GET /api/v1/attendance/generate-dat — TIS machine export for the same
   * day as attendance-full. text/plain, one fixed-width line per check-in
   * (0001) or check-out (0002) of each present employee. Returns the lines,
   * without blanks; an empty array means nobody was present that day.
   */
  generateDat: async (timestamp: string): Promise<string[]> => {
    const { data } = await apiClient.get<string>("/attendance/generate-dat", {
      params: { timestamp },
      responseType: "text",
      headers: { Accept: "text/plain" },
    });
    return data
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  },
};
