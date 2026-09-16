import { apiClient, getValidated } from '@/shared/api/client';

import {
  absenceListSchema,
  savedReportListSchema,
  type AbsenceRow,
  type ReportQuery,
  type SavedReport,
} from '../types';

export const reportsApi = {
  absenceByDepartment: (query: ReportQuery): Promise<AbsenceRow[]> =>
    getValidated('/reports/absence-by-department', absenceListSchema, { params: query }),

  saved: (): Promise<SavedReport[]> => getValidated('/reports/saved', savedReportListSchema),

  /** Generates the file server-side and hands back a blob to download. */
  export: async (query: ReportQuery & { format: string; columns: string[] }): Promise<Blob> => {
    const { data } = await apiClient.post('/reports/export', query, { responseType: 'blob' });
    return data as Blob;
  },
};
