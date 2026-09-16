import { getValidated, patchValidated } from '@/shared/api/client';

import {
  leaveListSchema,
  leaveStatsSchema,
  type LeaveList,
  type LeaveQuery,
  type LeaveStats,
} from '../types';

export const leaveApi = {
  list: (query: LeaveQuery): Promise<LeaveList> =>
    getValidated('/leave', leaveListSchema, { params: query }),

  stats: (): Promise<LeaveStats> => getValidated('/leave/stats', leaveStatsSchema),

  decide: (id: string, status: 'Approved' | 'Rejected'): Promise<LeaveList> =>
    patchValidated(`/leave/${id}`, leaveListSchema, { status }),
};
