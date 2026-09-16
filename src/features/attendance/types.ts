import { z } from 'zod';

export const SEARCH_COLUMNS = [
  { value: 'all', label: 'All columns' },
  { value: 'name', label: 'Name' },
  { value: 'employeeId', label: 'Emp ID' },
  { value: 'designation', label: 'Designation' },
  { value: 'department', label: 'Department' },
  { value: 'status', label: 'Status' },
] as const;

// HIDDEN — leave management. Restore 'On Leave' below to bring it back.
export const STATUS_FILTERS = ['All', 'Present', 'Late', 'Absent' /* , 'On Leave' */] as const;

export type SearchColumn = (typeof SEARCH_COLUMNS)[number]['value'];
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export interface AttendanceQuery {
  search: string;
  column: SearchColumn;
  status: StatusFilter;
  page: number;
  pageSize: number;
}

export const attendanceRowSchema = z.object({
  id: z.string(),
  serial: z.string(),
  employeeId: z.string(),
  name: z.string(),
  designation: z.string(),
  department: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  hours: z.string(),
  status: z.enum(['Present', 'Late', 'Absent' /* , 'On Leave' */]),
  camera: z.string(),
  confidence: z.number().nullable(),
});

export const attendancePageSchema = z.object({
  items: z.array(attendanceRowSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  /** Full roster size, so the footer can say "showing N of 1,300". */
  rosterTotal: z.number(),
});

export type AttendanceRow = z.infer<typeof attendanceRowSchema>;
export type AttendancePage = z.infer<typeof attendancePageSchema>;

export const DEFAULT_ATTENDANCE_QUERY: AttendanceQuery = {
  search: '',
  column: 'all',
  status: 'All',
  page: 1,
  pageSize: 10,
};
