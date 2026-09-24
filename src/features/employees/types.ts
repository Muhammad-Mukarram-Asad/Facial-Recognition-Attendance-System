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
  employeeId: z.string(),
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
});

export const employeeListSchema = z.object({
  items: z.array(employeeSchema),
  total: z.number(),
});

/** Payload for create/update. Required fields mirror the asterisks in the design. */
export const employeeInputSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
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
 * request payload — snake_case, split name, `id_card_no` instead of
 * `cnic`. `email` is confirmed to exist on the record (see
 * RealEmployeeRecord) even though the first working create payload
 * happened not to include it.
 */
export interface EmployeeWritePayload {
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
 * Adapts a real backend employee record onto the shape the rest of this
 * app's UI already renders (Employee, from the mock schema below). There's
 * no department/shift NAME lookup wired up for shift yet, so that still
 * shows as a "Shift #<id>" placeholder rather than a real name; department
 * and designation now resolve to real names via their Redux slices where
 * the form renders them (this adapter itself has no store access).
 */
export function toEmployee(record: RealEmployeeRecord): Employee {
  return {
    id: String(record.id ?? record.employee_code),
    employeeId: record.employee_code,
    name: record.full_name ?? `${record.first_name} ${record.last_name}`.trim(),
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
  };
}

export interface EmployeeQuery {
  search?: string;
  limit?: number;
  page?: number;
  includeDeleted?: boolean;
}

export const EMPTY_EMPLOYEE: EmployeeInput = {
  name: "",
  employeeId: "",
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
