import { z } from 'zod';

export const RANGE_OPTIONS = [
  { value: '24h', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '60d', label: '60 days' },
] as const;

export type DashboardRange = (typeof RANGE_OPTIONS)[number]['value'];

export const overviewSchema = z.object({
  range: z.string(),
  presence: z.object({
    present: z.number(),
    total: z.number(),
    rate: z.number(),
    onTime: z.number(),
    late: z.number(),
    absent: z.number(),
  }),
  workforce: z.object({
    total: z.number(),
    active: z.number(),
    probation: z.number(),
  }),
  absence: z.object({
    total: z.number(),
    unplanned: z.number(),
    onLeave: z.number(),
  }),
  pendingLeave: z.object({
    count: z.number(),
    overdue: z.number(),
    oldest: z.string(),
  }),
  hourlyCheckIns: z.array(z.object({ hour: z.string(), count: z.number() })),
  weeklyPunctuality: z.array(
    z.object({ day: z.string(), onTime: z.number(), late: z.number(), absent: z.number() }),
  ),
});

export const riskEntrySchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  meta: z.string(),
  score: z.number(),
});

export const streamEntrySchema = z.object({
  name: z.string(),
  camera: z.string(),
  time: z.string(),
  late: z.boolean(),
});

export const matrixRowSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string(),
  days: z.array(z.enum(['present', 'late', 'absent', 'leave'])),
});

export const riskListSchema = z.array(riskEntrySchema);
export const streamSchema = z.array(streamEntrySchema);
export const matrixSchema = z.array(matrixRowSchema);

export type DashboardOverview = z.infer<typeof overviewSchema>;
export type RiskEntry = z.infer<typeof riskEntrySchema>;
export type StreamEntry = z.infer<typeof streamEntrySchema>;
export type MatrixRow = z.infer<typeof matrixRowSchema>;
