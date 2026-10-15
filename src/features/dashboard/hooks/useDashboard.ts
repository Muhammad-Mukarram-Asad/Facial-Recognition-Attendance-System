"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { dashboardApi } from "../api/dashboard.api";

export function useAttendanceAnalytics(timestamp: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics(timestamp),
    queryFn: () => dashboardApi.analytics(timestamp),
    placeholderData: (previous) => previous,
  });
}
