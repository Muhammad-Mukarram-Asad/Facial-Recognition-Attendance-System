'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { leaveApi } from '../api/leave.api';
import type { LeaveQuery } from '../types';

export function useLeaveRequests(query: LeaveQuery) {
  return useQuery({
    queryKey: queryKeys.leave.list(query),
    queryFn: () => leaveApi.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useLeaveStats() {
  return useQuery({
    queryKey: queryKeys.leave.stats(),
    queryFn: leaveApi.stats,
  });
}

export function useDecideLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) =>
      leaveApi.decide(id, status),
    onSuccess: () => {
      // A decision moves numbers on the dashboard and the notification bell too.
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}
