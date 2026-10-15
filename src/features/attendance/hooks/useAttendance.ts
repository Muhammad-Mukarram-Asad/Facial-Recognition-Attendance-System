"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { attendanceApi } from "../api/attendance.api";

export function useAttendanceRegister(timestamp: string) {
  return useQuery({
    queryKey: queryKeys.attendance.register(timestamp),
    queryFn: () => attendanceApi.register(timestamp),
    placeholderData: (previous) => previous,
  });
}
