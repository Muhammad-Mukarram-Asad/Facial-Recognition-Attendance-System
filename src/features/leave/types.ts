import { z } from 'zod';

export const LEAVE_FILTERS = ['Pending', 'Decided', 'All'] as const;
export type LeaveFilter = (typeof LEAVE_FILTERS)[number];

export interface LeaveQuery {
  filter: LeaveFilter;
}

export const leaveRequestSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  name: z.string(),
  reason: z.string(),
  dates: z.string(),
  days: z.string(),
  type: z.enum(['Casual', 'Medical', 'Annual', 'Special']),
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  submittedAt: z.string(),
});

export const leaveListSchema = z.object({
  items: z.array(leaveRequestSchema),
  total: z.number(),
});

export const leaveStatsSchema = z.object({
  pending: z.number(),
  approvedThisMonth: z.number(),
  rejected: z.number(),
  onLeaveToday: z.number(),
});

export type LeaveRequest = z.infer<typeof leaveRequestSchema>;
export type LeaveList = z.infer<typeof leaveListSchema>;
export type LeaveStats = z.infer<typeof leaveStatsSchema>;
