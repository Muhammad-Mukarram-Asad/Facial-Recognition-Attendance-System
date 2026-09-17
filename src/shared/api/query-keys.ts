import type { AttendanceQuery } from '@/features/attendance/types';
import type { EmployeeQuery } from '@/features/employees/types';
import type { LeaveQuery } from '@/features/leave/types';
import type { ReportQuery } from '@/features/reports/types';

/**
 * Centralised query keys. Keeping them in one factory stops
 * invalidation from silently missing a cache entry.
 */
export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
  },
  dashboard: {
    all: () => ['dashboard'] as const,
    overview: (range: string) => ['dashboard', 'overview', range] as const,
    stream: () => ['dashboard', 'stream'] as const,
    risk: () => ['dashboard', 'risk'] as const,
  },
  attendance: {
    all: () => ['attendance'] as const,
    list: (query: AttendanceQuery) => ['attendance', 'list', query] as const,
  },
  employees: {
    all: () => ['employees'] as const,
    list: (query: EmployeeQuery) => ['employees', 'list', query] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    recent: () => ['employees', 'recent'] as const,
  },
  leave: {
    all: () => ['leave'] as const,
    list: (query: LeaveQuery) => ['leave', 'list', query] as const,
    stats: () => ['leave', 'stats'] as const,
  },
  reports: {
    all: () => ['reports'] as const,
    saved: () => ['reports', 'saved'] as const,
    absenceByDepartment: (query: ReportQuery) => ['reports', 'absence-by-department', query] as const,
  },
  profile: {
    detail: (id: string) => ['profile', id] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
  },
} as const;
