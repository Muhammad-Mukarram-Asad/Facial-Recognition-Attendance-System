import { getValidated } from "@/shared/api/client";

import { attendanceAnalyticsSchema, type AttendanceAnalytics } from "../types";

export const dashboardApi = {
  /** GET /api/v1/attendance/attendance-analytics — inclusive period. */
  analytics: (startAt: string, endAt: string): Promise<AttendanceAnalytics> =>
    getValidated("/attendance/attendance-analytics", attendanceAnalyticsSchema, {
      params: { start_at: startAt, end_at: endAt },
    }).then((response) => response.data),
};
