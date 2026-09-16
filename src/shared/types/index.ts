/** Shared domain primitives used across every feature module. */

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave';

/** Visual tone vocabulary from the design system. */
export type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'high' | 'medium';

export type Department =
  | 'Spinning — LTM-6'
  | 'Weaving'
  | 'Quality Control'
  | 'Maintenance'
  | 'Security'
  | 'Administration';

export type Shift =
  | 'A — 06:00 to 14:00'
  | 'B — 14:00 to 22:00'
  | 'C — 22:00 to 06:00'
  | 'General — 09:00 to 18:00';

export type EmploymentStatus = 'Active' | 'Probation' | 'Contract' | 'Suspended';

export type DayMark = 'present' | 'late' | 'absent' | 'leave';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
