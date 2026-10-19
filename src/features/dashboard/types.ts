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
 * One gate event. Same six fields on GET /api/v1/attendance/events and on
 * each `data:` frame from GET /api/v1/attendance/stream.
 */
export const attendanceStreamEventSchema = z.object({
  employee_name: z.string().optional().default(''),
  employee_id: z.number(),
  timestamp: z.string(),
  location: z.string().optional().default(''),
  image_path: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  event_type: z.string().optional().default(''),
});

/** GET /api/v1/attendance/events — newest first, last 24 hours. */
export const attendanceEventsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    window_hours: z.number(),
    total: z.number(),
    events: z.array(attendanceStreamEventSchema),
  }),
});

export type AttendanceStreamEvent = z.infer<typeof attendanceStreamEventSchema>;

/** Stable identity for a frame that has no event id. */
export function streamEventKey(event: AttendanceStreamEvent): string {
  return `${event.employee_id}|${event.timestamp}|${event.event_type}|${event.location}`;
}
