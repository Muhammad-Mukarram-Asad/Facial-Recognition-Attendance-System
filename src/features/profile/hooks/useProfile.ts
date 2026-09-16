'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { profileApi } from '../api/profile.api';

export function useEmployeeProfile(employeeId: string) {
  return useQuery({
    queryKey: queryKeys.profile.detail(employeeId),
    queryFn: () => profileApi.detail(employeeId),
    enabled: Boolean(employeeId),
  });
}
