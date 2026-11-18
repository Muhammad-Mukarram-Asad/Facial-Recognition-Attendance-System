import { z } from "zod";

/**
 * Workforce employment status (`employment_status`; `employee_status` on
 * attendance payloads). Also the slugs for
 * PUT /api/v1/employees/{id}/status/{status_slug}.
 */
export const EMPLOYEE_STATUS_SLUGS = [
  "active",
  "inactive",
  "blacklisted",
  "vip",
] as const;

export type EmployeeStatusSlug = (typeof EMPLOYEE_STATUS_SLUGS)[number];

export function toEmployeeStatusSlug(
  value: string | null | undefined,
): EmployeeStatusSlug | null {
  const slug = value?.trim().toLowerCase();
  return EMPLOYEE_STATUS_SLUGS.find((status) => status === slug) ?? null;
}

/** `is_active` that goes with a status: inactive is false, the rest true. */
export function isActiveForStatus(status: EmployeeStatusSlug): boolean {
  return status !== "inactive";
}

export const EMPLOYEE_DIVISIONS = [
  "RIJA FASHIONS 1",
  "RIJA FASHIONS 3",
] as const;

export type EmployeeDivision = (typeof EMPLOYEE_DIVISIONS)[number];

export const employeeSchema = z.object({
  id: z.string(),
  employeeCode: z.string(),
  attendanceCode: z.string(),
  fullName: z.string(),
  // firstName: z.string(),
  // lastName: z.string(),
  /** Full name, for lists and avatars. */
  name: z.string(),
  designation: z.string(),
  designationId: z.number().nullable(),
  department: z.string(),
  departmentId: z.number().nullable(),
  /** "" when the record has no division. */
  division: z.string(),
  // shift: z.string(),
  // shiftId: z.number().nullable(),
  /** 24-hour HH:MM entered on the form. Empty when the record has no times. */
  shiftStart: z.string(),
  shiftEnd: z.string(),
  employmentStatus: z.string(),
  phone: z.string(),
  cnic: z.string(),
  hire_date: z.string(),
  // email: z.string(),
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
  fullName: z.string().trim().min(1, "Full name is required"),
  // firstName: z.string().trim().min(1, "First name is required"),
  // lastName: z.string().optional().default(""),
  attendanceCode: z.string().trim().min(1, "Attendance code is required"),
  employeeCode: z.string().trim().min(1, "Employee code is required"),
  cnic: z.string().optional().default(""),
  hire_date: z.string().optional().default(""),
  // phone: z.string().optional().default(""),
  // email: z.string().email("Enter a valid email").or(z.literal("")).default(""),
  // dateOfBirth: z.string().optional().default(""),
  departmentId: z.coerce.number().min(0),
  /** Select value: "" | department id. */
  departmentChoice: z.string(),
  designationId: z.coerce.number().min(0),
  /** Select value: "" | designation id. */
  designationChoice: z.string(),
  designation: z.string().optional().default(""),
  // shiftId: z.coerce.number().min(0),
  /** 24-hour HH:MM. */
  shiftStart: z.string(),
  shiftEnd: z.string(),
  /** "" means no division. */
  division: z.union([z.enum(EMPLOYEE_DIVISIONS), z.literal("")]),
  employmentStatus: z.enum(EMPLOYEE_STATUS_SLUGS),
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
 * request payload — snake_case, `first_name`, separate attendance and
 * employee codes, and `joining_date`. `id_card_no` is sent on update
 * only; the add form does not collect it.
 */
export interface EmployeeWritePayload {
  /** Workforce primary key. Sent as an integer on update. */
  id?: number;
  /** Create only — name and both codes are locked on edit. */
  employee_code?: string;
  attendance_code?: string;
  /** TEMPORARY: carries the form's full name until first/last are split. */
  first_name?: string;
  // last_name: string;
  department_id?: number | null;
  designation_id?: number | null;
  division?: EmployeeDivision | null;
  /**
   * 24-hour HH:MM. Both or neither. The backend resolves the shift from
   * these times — `shift_id` is no longer sent.
   */
  shift_start_time?: string;
  shift_end_time?: string;
  employment_status?: EmployeeStatusSlug;
  is_active?: boolean;
  /** yyyy-mm-dd. Omitted when the form leaves joining date blank. */
  hire_date?: string;
  /** Sent when editing an existing record. The add form does not collect it. */
  id_card_no?: string;
  // phone?: string;
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
  hire_date?: string | null;
  phone?: string | null;
  job_title?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  division?: string | null;
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

/** Calendar date for `<input type="date">`: yyyy-mm-dd, or "" when absent. */
function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  if (iso) return iso[1];
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return "";
}

/** A blank last name is shown and stored as a dash. */
export function lastNameOrDash(lastName: string | null | undefined): string {
  const trimmed = lastName?.trim() ?? "";
  return trimmed ? trimmed : "-";
}

export function employeeDisplayName(
  firstName: string,
  lastName: string,
): string {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!last || last === "-") return first;
  return `${first} ${last}`.trim();
}

export function toEmployee(record: RealEmployeeRecord): Employee {
  const firstName = record.first_name?.trim() ?? "";
  const lastName = lastNameOrDash(record.last_name);
  const fullName =
    record.full_name?.trim() || employeeDisplayName(firstName, lastName);
  return {
    id: String(record.id ?? record.employee_code),
    employeeCode: record.employee_code,
    attendanceCode: record.attendance_code?.trim() ?? "",
    fullName,
    // firstName,
    // lastName,
    name: fullName,
    designation:
      record.job_title?.trim() || record.designation_name?.trim() || "",
    designationId: record.designation_id ?? null,
    department:
      record.department_name?.trim() ||
      (record.department_id != null ? `Dept #${record.department_id}` : ""),
    departmentId: record.department_id ?? null,
    division: record.division?.trim() ?? "",
    // shift: record.shift_id != null ? `Shift #${record.shift_id}` : "",
    // shiftId: record.shift_id ?? null,
    shiftStart: clockTime(record.shift_start_time),
    shiftEnd: clockTime(record.shift_end_time),
    employmentStatus:
      record.employment_status ?? (record.is_active ? "active" : "inactive"),
    phone: record.phone ?? "",
    cnic: record.id_card_no ?? "",
    hire_date: toDateInput(record.hire_date),
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
  fullName: "",
  // firstName: "",
  // lastName: "",
  attendanceCode: "",
  employeeCode: "",
  cnic: "",
  hire_date: "",
  // phone: "",
  departmentId: 0,
  departmentChoice: "",
  designationId: 0,
  designationChoice: "",
  designation: "",
  shiftStart: "",
  shiftEnd: "",
  division: "",
  employmentStatus: "active",
};
