import { z } from "zod";

/** GET /api/v1/attendance/attendance-full — one calendar day. */
export const attendanceRegisterSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    attendance_date: z.string(),
    timestamp: z.string(),
    total: z.number(),
    records: z.array(
      z.object({
        employee_id: z.number(),
        name: z.string(),
        designation: z.string().nullable(),
        department: z.string().nullable(),
        check_in: z.string().nullable(),
        check_out: z.string().nullable(),
        hours: z.number().nullable(),
        status: z.string(),
        is_late: z.boolean(),
        is_early_departure: z.boolean(),
        image_path: z
          .string()
          .nullable()
          .optional()
          .transform((value) => (value && value.length > 0 ? value : null)),
      }),
    ),
  }),
});

export type AttendanceRegister = z.infer<typeof attendanceRegisterSchema>["data"];
export type AttendanceRecord = AttendanceRegister["records"][number];

/**
 * Calendar day the user picked, with the current UTC clock and a +05:00 offset.
 * The API adds those five hours, so 14:27 UTC is read as 19:27 in Asia/Karachi.
 */
export function toRegisterTimestamp(date: Date, now = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:00`;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// export const AttendanceStatus = z.enum(["present", "absent", "leave", "blacklisted", "pending", "incomplete"]);
export const AttendanceStatus = z.enum(["present", "absent", "late", "blacklisted"]);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;
