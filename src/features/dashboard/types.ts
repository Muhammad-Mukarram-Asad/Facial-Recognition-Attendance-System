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

/** Noon in Asia/Karachi so analytics-today uses the calendar day the user picked. */
export function toDayTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00+05:00`;
}

/** GET /api/v1/attendance/analytics-today — one calendar day. */
export const attendanceAnalyticsSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    attendance_date: z.string(),
    timestamp: z.string(),
    present: z.number(),
    absent: z.number(),
    late: z.number(),
    leave: z.number(),
    blacklisted: z.number(),
    total: z.number(),
    present_percent: z.number(),
    absent_percent: z.number(),
    late_percent: z.number(),
    blacklisted_percent: z.number(),
    total_employees: z.number(),
    enrolled_faces: z.number(),
  }),
});

export type AttendanceAnalytics = z.infer<typeof attendanceAnalyticsSchema>["data"];

/**
 * One `data:` frame from GET /api/v1/attendance/stream (SSE).
 * Keepalives arrive as `event: keepalive` with no JSON body and never reach here.
 */
export interface AttendanceStreamEvent {
  employee_name: string;
  employee_id: number;
  /** ISO 8601 gate detection time. */
  timestamp: string;
  /** Gate slug, e.g. "gate_01". */
  location: string;
  /** Storage key for the gate capture. Null when the frame has no photo. */
  photo_path: string | null;
  /** "entry" | "exit". */
  event_type: string;
}

/** Stable identity for a frame that has no event id. */
export function streamEventKey(event: AttendanceStreamEvent): string {
  return `${event.employee_id}|${event.timestamp}|${event.event_type}|${event.location}`;
}
