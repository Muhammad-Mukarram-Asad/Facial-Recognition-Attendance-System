/** Shared domain primitives used across every feature module. */

// HIDDEN — leave management. Restore 'On Leave' below to bring it back.
export type AttendanceStatus = 'Present' | 'Late' | 'Absent' /* | 'On Leave' */;

/** Visual tone vocabulary from the design system. */
export type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'high' | 'medium';

export type Department =
  | 'Spinning — LTM-6'
  | 'Weaving'
  | 'Quality Control'
  | 'Maintenance'
  | 'Security'
  | 'Administration';

export type Shift = 'General — 09:00 to 17:00';

export type EmploymentStatus = 'Active' | 'Probation' | 'Contract' | 'Suspended';

// HIDDEN — leave management. Restore 'leave' below to bring it back.
export type DayMark = 'present' | 'late' | 'absent' /* | 'leave' */;

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
