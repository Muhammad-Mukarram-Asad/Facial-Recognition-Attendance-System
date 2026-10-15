import { getValidated } from "@/shared/api/client";

import { attendanceRegisterSchema, type AttendanceRegister } from "../types";

export const attendanceApi = {
  /** GET /api/v1/attendance/attendance-full */
  register: (timestamp: string): Promise<AttendanceRegister> =>
    getValidated("/attendance/attendance-full", attendanceRegisterSchema, {
      params: { timestamp },
    }).then((response) => response.data),
};
