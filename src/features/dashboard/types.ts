import { z } from 'zod';

export const RANGE_OPTIONS = [
  { value: '24h', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '60d', label: '60 days' },
] as const;

export type DashboardRange = (typeof RANGE_OPTIONS)[number]['value'];

/** Wider ranges soften the daily spikes; keeps the range switcher meaningful. */
export const RANGE_SCALE: Record<DashboardRange, number> = { '24h': 1, '7d': 0.94, '30d': 0.89, '60d': 0.86 };

export const overviewSchema = z.object({
  range: z.string(),
  presence: z.object({
    present: z.number(),
    total: z.number(),
    rate: z.number(),
    onTime: z.number(),
    late: z.number(),
    absent: z.number(),
  }),
  workforce: z.object({
    total: z.number(),
    active: z.number(),
  }),
  absence: z.object({
    total: z.number(),
  }),
  device: z.object({
    enrolledFaces: z.number(),
    gateCameras: z.number(),
    matchAccuracy: z.number(),
  }),
  // DUMMY — replace with the strangers/watchlist feed once that API is integrated.
  security: z.object({
    strangers: z.number(),
    blacklisted: z.number(),
    strangersByCamera: z.array(z.object({ camera: z.string(), count: z.number() })),
    blacklistedByCamera: z.array(z.object({ camera: z.string(), count: z.number() })),
  }),
  // HIDDEN — leave management.
  // pendingLeave: z.object({
  //   count: z.number(),
  //   overdue: z.number(),
  //   oldest: z.string(),
  // }),
  hourlyCheckIns: z.array(z.object({ hour: z.string(), count: z.number() })),
  weeklyPunctuality: z.array(
    z.object({ day: z.string(), onTime: z.number(), late: z.number(), absent: z.number() }),
  ),
});

export const riskEntrySchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  meta: z.string(),
  score: z.number(),
});

export const streamEntrySchema = z.object({
  name: z.string(),
  camera: z.string(),
  time: z.string(),
  late: z.boolean(),
});

export const riskListSchema = z.array(riskEntrySchema);
export const streamSchema = z.array(streamEntrySchema);

export type DashboardOverview = z.infer<typeof overviewSchema>;
export type RiskEntry = z.infer<typeof riskEntrySchema>;
export type StreamEntry = z.infer<typeof streamEntrySchema>;

/**
 * One `data:` frame from GET /api/v1/attendance/stream (SSE) — the row the
 * Kafka consumer just saved to `attendance_events`, per the backend API doc.
 * Keepalives arrive as `event: keepalive` with no data and never reach here.
 */
export interface AttendanceStreamEvent {
  id: number;
  employee_id: number;
  employee_name: string;
  /** ISO 8601 with offset, e.g. "2026-09-21T04:01:00+00:00". */
  timestamp: string;
  /** "entry" | "exit" per the doc; typed loosely so a new type doesn't break parsing. */
  event_type: string;
  location: string;
}
