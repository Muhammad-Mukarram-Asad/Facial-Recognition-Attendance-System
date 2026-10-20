"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { dashboardApi } from "../api/dashboard.api";

/** How often dashboard counts catch up with gate events that arrived on the stream. */
const ANALYTICS_REFRESH_MS = 30_000;

export function useAttendanceAnalytics(timestamp: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.analytics(timestamp),
    queryFn: () => dashboardApi.analytics(timestamp),
    placeholderData: (previous) => previous,
    refetchInterval: ANALYTICS_REFRESH_MS,
  });
}
