import { getValidated, patchValidated } from '@/shared/api/client';

import { attendancePageSchema, type AttendancePage, type AttendanceQuery } from '../types';

export const attendanceApi = {
  list: (query: AttendanceQuery): Promise<AttendancePage> =>
    getValidated('/attendance', attendancePageSchema, { params: query }),

  /** Bulk override used when a supervisor corrects the gate log. */
  bulkUpdateStatus: (ids: string[], status: string): Promise<AttendancePage> =>
    patchValidated('/attendance', attendancePageSchema, { ids, status }),
};
