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
      }),
    ),
  }),
});

export type AttendanceRegister = z.infer<typeof attendanceRegisterSchema>["data"];
export type AttendanceRecord = AttendanceRegister["records"][number];

/** Noon in Asia/Karachi so the register uses the calendar day the user picked. */
export function toRegisterTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00+05:00`;
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// export const AttendanceStatus = z.enum(["present", "absent", "leave", "blacklisted", "pending", "incomplete"]);
export const AttendanceStatus = z.enum(["present", "absent", "late", "early"]);
export type AttendanceStatus = z.infer<typeof AttendanceStatus>;
