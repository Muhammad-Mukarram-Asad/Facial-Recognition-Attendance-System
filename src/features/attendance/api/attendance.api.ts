import { getValidated } from "@/shared/api/client";

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
  is_early_departure?: boolean;
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
    if (query.is_early_departure) params.is_early_departure = true;

    return getValidated("/attendance/attendance-full", attendanceRegisterSchema, { params }).then(
      (response) => response.data,
    );
  },
};
