import { getValidated } from "@/shared/api/client";

import { attendanceAnalyticsSchema, type AttendanceAnalytics } from "../types";

export const dashboardApi = {
  /** GET /api/v1/attendance/analytics-today. Omit timestamp for today. */
  analytics: (timestamp: string): Promise<AttendanceAnalytics> =>
    getValidated("/attendance/analytics-today", attendanceAnalyticsSchema, {
      params: { timestamp },
    }).then((response) => response.data),
};
