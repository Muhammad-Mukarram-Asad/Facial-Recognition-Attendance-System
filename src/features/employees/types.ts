import { z } from "zod";

export const SHIFTS = ["General — 09:00 to 17:00"] as const;

export const EMPLOYMENT_STATUSES = [
  "Active",
  "Probation",
  "Contract",
  "Suspended",
] as const;

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
  shift: z.string(),
  employmentStatus: z.string(),
  email: z.string(),
  phone: z.string(),
  cnic: z.string(),
  joiningDate: z.string(),
  dateOfBirth: z.string(),
  reportingManager: z.string(),
  gateCamera: z.string(),
  gracePeriodMinutes: z.number(),
  weeklyOff: z.string(),
  overtimeEligible: z.boolean(),
  exemptFromLatePenalty: z.boolean(),
  absenceSmsToManager: z.boolean(),
  enrolledAngles: z.number(),
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
  email: z.string().email("Enter a valid email").or(z.literal("")).default(""),
  dateOfBirth: z.string().optional().default(""),
  departmentId: z.coerce.number().positive("Department is required"),
  designationId: z.coerce.number().positive("Designation is required"),
  designation: z.string().optional().default(""),
  shift: z.enum(SHIFTS),
  joiningDate: z.string().optional().default(""),
  reportingManager: z.string().optional().default(""),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  gracePeriodMinutes: z.coerce.number().min(0).max(120),
  gateCamera: z.string().optional().default(""),
  weeklyOff: z.string().optional().default(""),
  overtimeEligible: z.boolean(),
  exemptFromLatePenalty: z.boolean(),
  absenceSmsToManager: z.boolean(),
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
  department_id: number;
  designation_id: number;
  shift_id: number | null;
  employment_status: string;
  is_active: boolean;
  id_card_no?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  job_title?: string;
  hire_date?: string;
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
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  hire_date?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  id_card_no?: string | null;
  division?: string | null;
  department_id?: number | null;
  designation_id?: number | null;
  shift_id?: number | null;
  user_id?: number | null;
  employment_status?: string | null;
  is_active?: boolean;
  photo_path?: string | null;
  has_face_embedding?: boolean;
  created_at?: string;
}

/**
 * Adapts a backend employee record onto the shape the rest of this
 * app's UI renders. There's
 * no department/shift NAME lookup wired up for shift yet, so that still
 * shows as a "Shift #<id>" placeholder rather than a real name; department
 * and designation now resolve to real names via their Redux slices where
 * the form renders them (this adapter itself has no store access).
 */
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
    designation: record.job_title ?? "",
    designationId: record.designation_id ?? null,
    department:
      record.department_id != null ? `Dept #${record.department_id}` : "",
    departmentId: record.department_id ?? null,
    shift: record.shift_id != null ? `Shift #${record.shift_id}` : "",
    employmentStatus: record.employment_status ?? (record.is_active ? "active" : "inactive"),
    email: record.email ?? "",
    phone: record.phone ?? "",
    cnic: record.id_card_no ?? "",
    joiningDate: record.hire_date ?? "",
    dateOfBirth: record.date_of_birth ?? "",
    reportingManager: "",
    gateCamera: "",
    gracePeriodMinutes: 0,
    weeklyOff: "",
    overtimeEligible: true,
    exemptFromLatePenalty: false,
    absenceSmsToManager: true,
    enrolledAngles: 0,
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
  email: "",
  dateOfBirth: "",
  departmentId: 0,
  designationId: 0,
  designation: "",
  shift: "General — 09:00 to 17:00",
  joiningDate: "",
  reportingManager: "",
  employmentStatus: "Active",
  gracePeriodMinutes: 0,
  gateCamera: "",
  weeklyOff: "",
  overtimeEligible: true,
  exemptFromLatePenalty: false,
  absenceSmsToManager: true,
};
