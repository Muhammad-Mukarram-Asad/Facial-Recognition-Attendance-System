import { getValidated } from '@/shared/api/client';

import {
  overviewSchema,
  riskListSchema,
  streamSchema,
  type DashboardOverview,
  type DashboardRange,
  type RiskEntry,
  type StreamEntry,
} from '../types';

export const dashboardApi = {
  overview: (range: DashboardRange): Promise<DashboardOverview> =>
    getValidated('/dashboard/overview', overviewSchema, { params: { range } }),

  risk: (): Promise<RiskEntry[]> => getValidated('/dashboard/risk', riskListSchema),

  stream: (): Promise<StreamEntry[]> => getValidated('/dashboard/stream', streamSchema),
};
