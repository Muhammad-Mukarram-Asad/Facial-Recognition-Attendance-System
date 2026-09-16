import { z } from 'zod';

export const profileSchema = z.object({
  employeeId: z.string(),
  name: z.string(),
  designation: z.string(),
  department: z.string(),
  status: z.enum(['Present', 'Late', 'Absent', 'On Leave']),
  gateCamera: z.string(),
  stats: z.object({
    attendanceRate: z.string(),
    lateArrivals: z.string(),
    absences: z.string(),
    averageHours: z.string(),
  }),
  history: z.array(z.enum(['present', 'late', 'absent', 'leave'])),
  historyLabel: z.string(),
  punches: z.array(z.object({ kind: z.string(), camera: z.string(), time: z.string() })),
});

export type EmployeeProfile = z.infer<typeof profileSchema>;
