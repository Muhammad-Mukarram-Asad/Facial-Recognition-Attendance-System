import { z } from "zod";

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Inclusive Asia/Karachi bounds for the selected calendar day. */
export function toPeriodBounds(date: Date): { start_at: string; end_at: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const stamp = `${year}-${month}-${day}`;
  return {
    start_at: `${stamp}T00:00:00+05:00`,
    end_at: `${stamp}T23:59:59+05:00`,
  };
}

/** GET /api/v1/attendance/attendance-analytics — inclusive period. */
export const attendanceAnalyticsSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    period_from: z.string(),
    period_to: z.string(),
    present_percent: z.number(),
    absent_percent: z.number(),
    late_percent: z.number(),
    total_employees: z.number(),
    enrolled_faces: z.number(),
    blacklisted_attempts: z.number(),
  }),
});

export type AttendanceAnalytics = z.infer<typeof attendanceAnalyticsSchema>["data"];

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
