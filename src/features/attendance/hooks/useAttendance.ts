'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { attendanceApi } from '../api/attendance.api';
import type { AttendanceQuery } from '../types';

export function useAttendanceList(query: AttendanceQuery) {
  return useQuery({
    queryKey: queryKeys.attendance.list(query),
    queryFn: () => attendanceApi.list(query),
    // Typing in the search box shouldn't blank the table out.
    placeholderData: (previous) => previous,
  });
}

export function useBulkUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      attendanceApi.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
    },
  });
}
