import { z } from 'zod';

export const DEPARTMENTS = [
  'Spinning — LTM-6',
  'Weaving',
  'Quality Control',
  'Maintenance',
  'Security',
  'Administration',
] as const;

export const SHIFTS = [
  'A — 06:00 to 14:00',
  'B — 14:00 to 22:00',
  'C — 22:00 to 06:00',
  'General — 09:00 to 18:00',
] as const;

export const EMPLOYMENT_STATUSES = ['Active', 'Probation', 'Contract', 'Suspended'] as const;

export const employeeSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  name: z.string(),
  designation: z.string(),
  department: z.string(),
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
  name: z.string().min(1, 'Full name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  cnic: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Enter a valid email').or(z.literal('')).default(''),
  dateOfBirth: z.string().optional().default(''),
  department: z.enum(DEPARTMENTS),
  designation: z.string().min(1, 'Designation is required'),
  shift: z.enum(SHIFTS),
  joiningDate: z.string().optional().default(''),
  reportingManager: z.string().optional().default(''),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  gracePeriodMinutes: z.coerce.number().min(0).max(120),
  gateCamera: z.string().optional().default(''),
  weeklyOff: z.string().optional().default(''),
  overtimeEligible: z.boolean(),
  exemptFromLatePenalty: z.boolean(),
  absenceSmsToManager: z.boolean(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeList = z.infer<typeof employeeListSchema>;
export type EmployeeInput = z.infer<typeof employeeInputSchema>;

export interface EmployeeQuery {
  search?: string;
  limit?: number;
}

export const EMPTY_EMPLOYEE: EmployeeInput = {
  name: '',
  employeeId: '',
  cnic: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  department: 'Spinning — LTM-6',
  designation: '',
  shift: 'A — 06:00 to 14:00',
  joiningDate: '',
  reportingManager: '',
  employmentStatus: 'Active',
  gracePeriodMinutes: 10,
  gateCamera: 'nvr4 d12 Gate 2',
  weeklyOff: 'Sunday',
  overtimeEligible: true,
  exemptFromLatePenalty: false,
  absenceSmsToManager: true,
};
