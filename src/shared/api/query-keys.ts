import type { EmployeeQuery } from "@/features/employees/types";

/**
 * Centralised query keys. Keeping them in one factory stops
 * invalidation from silently missing a cache entry.
 */
export const queryKeys = {
  dashboard: {
    analytics: (startAt: string, endAt: string) => ["dashboard", "analytics", startAt, endAt] as const,
  },
  liveAttendance: {
    today: () => ["live-attendance", "today"] as const,
    connection: () => ["live-attendance", "connection"] as const,
  },
  employees: {
    all: () => ["employees"] as const,
    list: (query: EmployeeQuery) => ["employees", "list", query] as const,
    detail: (id: string) => ["employees", "detail", id] as const,
    recent: () => ["employees", "recent"] as const,
  },
} as const;
