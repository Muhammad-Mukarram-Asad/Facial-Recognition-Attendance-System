import { z } from "zod";

export const EMPLOYMENT_STATUSES = [
  "Active",
  "Probation",
  "Contract",
  "Suspended",
] as const;

/** PUT /api/v1/employees/{id}/status/{status_slug} */
export const EMPLOYEE_STATUS_SLUGS = [
  "active",
  "inactive",
  "on-leave",
  "blacklisted",
] as const;

export type EmployeeStatusSlug = (typeof EMPLOYEE_STATUS_SLUGS)[number];

export const employeeSchema = z.object({
  id: z.string(),
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  /** First and last name together, for lists and avatars. */
  name: z.string(),
  designation: z.string(),
  designationId: z.number().nullable(),
  department: z.string(),
  departmentId: z.number().nullable(),
  // shift: z.string(),
  // shiftId: z.number().nullable(),
  /** 24-hour HH:MM entered on the form. Empty when the record has no times. */
  shiftStart: z.string(),
  shiftEnd: z.string(),
  employmentStatus: z.string(),
  phone: z.string(),
  cnic: z.string(),
  // email: z.string(),
  // joiningDate: z.string(),
  // dateOfBirth: z.string(),
  // reportingManager: z.string(),
  // gateCamera: z.string(),
  // gracePeriodMinutes: z.number(),
  // weeklyOff: z.string(),
  // overtimeEligible: z.boolean(),
  // exemptFromLatePenalty: z.boolean(),
  // absenceSmsToManager: z.boolean(),
  // enrolledAngles: z.number(),
  createdAt: z.string(),
  /** MinIO object key for the enrollment photo, or null when none is stored. */
  photoPath: z.string().nullable(),
});

export const employeeListSchema = z.object({
  items: z.array(employeeSchema),
  total: z.number(),
});

/** Payload for create/update. Required fields mirror the asterisks in the design. */
export const employeeInputSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().optional().default(""),
  employeeCode: z.string().min(1, "Employee Code is required"),
  cnic: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  // email: z.string().email("Enter a valid email").or(z.literal("")).default(""),
  // dateOfBirth: z.string().optional().default(""),
  departmentId: z.coerce.number().min(0),
  /** Select value: "" | "other" | department id. */
  departmentChoice: z.string(),
  customDepartment: z.string(),
  designationId: z.coerce.number().min(0),
  /** Select value: "" | "other" | designation id. */
  designationChoice: z.string(),
  customDesignation: z.string(),
  designation: z.string().optional().default(""),
  // shiftId: z.coerce.number().min(0),
  /** 24-hour HH:MM. */
  shiftStart: z.string(),
  shiftEnd: z.string(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  // joiningDate: z.string().optional().default(""),
  // reportingManager: z.string().optional().default(""),
  // gracePeriodMinutes: z.coerce.number().min(0).max(120),
  // gateCamera: z.string().optional().default(""),
  // weeklyOff: z.string().optional().default(""),
  // overtimeEligible: z.boolean(),
  // exemptFromLatePenalty: z.boolean(),
  // absenceSmsToManager: z.boolean(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeList = z.infer<typeof employeeListSchema>;
export type EmployeeInput = z.infer<typeof employeeInputSchema>;

/**
 * The `employee_data` JSON body the real /api/v1/employees endpoints
 * accept (POST to create, PUT to update), confirmed against a working
 * request payload — snake_case, separate first and last name, `id_card_no` instead of
 * `cnic`. `email` is confirmed to exist on the record (see
 * RealEmployeeRecord) even though the first working create payload
 * happened not to include it.
 */
export interface EmployeeWritePayload {
  /** Workforce primary key. Sent as an integer on update. */
  id?: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  department_id?: number | null;
  /** Present when the form's department picker is Other. */
  department_name?: string;
  designation_id?: number | null;
  /** Present when the form's designation picker is Other. */
  designation_name?: string;
  shift_id?: number | null;
  /** 24-hour HH:MM. Replaces a shift picked from the shifts catalog. */
  shift_start_time: string;
  shift_end_time: string;
  employment_status: string;
  is_active: boolean;
  id_card_no?: string;
  phone?: string;
}

/**
 * The real backend's employee record shape (GET/POST/PUT response),
 * confirmed against actual list/detail responses. Optional because the
 * exact envelope isn't fully pinned down — fields may be missing rather
 * than present-but-empty.
 */
export interface RealEmployeeRecord {
  id?: number | string;
  employee_code: string;
  attendance_code?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string | null;
  job_title?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  designation_id?: number | null;
  designation_name?: string | null;
  shift_id?: number | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  user_id?: number | null;
  employment_status?: string | null;
  is_active?: boolean;
  photo_path?: string | null;
  has_face_embedding?: boolean;
  created_at?: string;
  id_card_no?: string;
}

/**
 * Adapts a backend employee record onto the shape the rest of this
 * app's UI renders. Department and designation names come from the
 * record when the backend sends them; otherwise the id is shown.
 * Shift start and end are the 24-hour times stored on the record.
 */
function clockTime(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return "";
  return `${match[1]}:${match[2]}`;
}

/** A blank last name is shown and stored as a dash. */
export function lastNameOrDash(lastName: string | null | undefined): string {
  const trimmed = lastName?.trim() ?? "";
  return trimmed ? trimmed : "-";
}

export function employeeDisplayName(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!last || last === "-") return first;
  return `${first} ${last}`.trim();
}

export function toEmployee(record: RealEmployeeRecord): Employee {
  const firstName = record.first_name?.trim() ?? "";
  const lastName = lastNameOrDash(record.last_name);
  return {
    id: String(record.id ?? record.employee_code),
    employeeCode: record.employee_code,
    firstName,
    lastName,
    name: record.full_name?.trim() || employeeDisplayName(firstName, lastName),
    designation: record.job_title?.trim() || record.designation_name?.trim() || "",
    designationId: record.designation_id ?? null,
    department:
      record.department_name?.trim() ||
      (record.department_id != null ? `Dept #${record.department_id}` : ""),
    departmentId: record.department_id ?? null,
    // shift: record.shift_id != null ? `Shift #${record.shift_id}` : "",
    // shiftId: record.shift_id ?? null,
    shiftStart: clockTime(record.shift_start_time),
    shiftEnd: clockTime(record.shift_end_time),
    employmentStatus: record.employment_status ?? (record.is_active ? "active" : "inactive"),
    phone: record.phone ?? "",
    cnic: record.id_card_no ?? "",
    createdAt: record.created_at ?? "",
    photoPath: record.photo_path?.trim() ? record.photo_path : null,
  };
}

export interface EmployeeQuery {
  search?: string;
  limit?: number;
  page?: number;
  includeDeleted?: boolean;
}

export const EMPTY_EMPLOYEE: EmployeeInput = {
  firstName: "",
  lastName: "",
  employeeCode: "",
  cnic: "",
  phone: "",
  departmentId: 0,
  departmentChoice: "",
  customDepartment: "",
  designationId: 0,
  designationChoice: "",
  customDesignation: "",
  designation: "",
  shiftStart: "",
  shiftEnd: "",
  employmentStatus: "Active",
};
