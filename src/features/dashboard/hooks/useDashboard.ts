'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { dashboardApi } from '../api/dashboard.api';
import type { DashboardRange } from '../types';

export function useDashboardOverview(range: DashboardRange) {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(range),
    queryFn: () => dashboardApi.overview(range),
    // Ranges are cheap to switch between; keep the previous chart on screen.
    placeholderData: (previous) => previous,
  });
}

export function useRiskList() {
  return useQuery({
    queryKey: queryKeys.dashboard.risk(),
    queryFn: dashboardApi.risk,
  });
}

export function useClockInStream() {
  return useQuery({
    queryKey: queryKeys.dashboard.stream(),
    queryFn: dashboardApi.stream,
    // The gate stream is the one genuinely live surface on this page.
    refetchInterval: 15_000,
  });
}

export function useStatusMatrix() {
  return useQuery({
    queryKey: queryKeys.dashboard.matrix(),
    queryFn: dashboardApi.matrix,
  });
}
