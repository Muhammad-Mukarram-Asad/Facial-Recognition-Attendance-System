import { getValidated } from '@/shared/api/client';

import {
  matrixSchema,
  overviewSchema,
  riskListSchema,
  streamSchema,
  type DashboardOverview,
  type DashboardRange,
  type MatrixRow,
  type RiskEntry,
  type StreamEntry,
} from '../types';

export const dashboardApi = {
  overview: (range: DashboardRange): Promise<DashboardOverview> =>
    getValidated('/dashboard/overview', overviewSchema, { params: { range } }),

  risk: (): Promise<RiskEntry[]> => getValidated('/dashboard/risk', riskListSchema),

  stream: (): Promise<StreamEntry[]> => getValidated('/dashboard/stream', streamSchema),

  matrix: (): Promise<MatrixRow[]> => getValidated('/dashboard/matrix', matrixSchema),
};
