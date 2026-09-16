import { z } from 'zod';

export const REPORT_TYPES = [
  'Daily attendance register',
  'Monthly summary per employee',
  'Late arrivals and early exits',
  'Absence and leave ledger',
  'Overtime hours',
] as const;

export const REPORT_DEPARTMENTS = [
  'All departments',
  'Spinning — LTM-6',
  'Weaving',
  'Quality Control',
  'Security',
] as const;

export const REPORT_COLUMNS = [
  { id: 'times', label: 'Check in / check out', default: true },
  { id: 'hours', label: 'Worked hours', default: true },
  { id: 'camera', label: 'Camera and confidence', default: false },
  { id: 'leaveBalance', label: 'Leave balance', default: false },
] as const;

export type ReportColumnId = (typeof REPORT_COLUMNS)[number]['id'];

export interface ReportQuery {
  type: string;
  from: string;
  to: string;
  department: string;
}

export const absenceRowSchema = z.object({
  department: z.string(),
  count: z.number(),
  share: z.number(),
});

export const savedReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: z.string(),
  size: z.string(),
});

export const absenceListSchema = z.array(absenceRowSchema);
export const savedReportListSchema = z.array(savedReportSchema);

export type AbsenceRow = z.infer<typeof absenceRowSchema>;
export type SavedReport = z.infer<typeof savedReportSchema>;
