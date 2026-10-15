"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { dashboardApi } from "../api/dashboard.api";

export function useAttendanceAnalytics(startAt: string, endAt: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics(startAt, endAt),
    queryFn: () => dashboardApi.analytics(startAt, endAt),
    placeholderData: (previous) => previous,
  });
}
