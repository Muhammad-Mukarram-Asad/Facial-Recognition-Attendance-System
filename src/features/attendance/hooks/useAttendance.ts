"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { attendanceApi, type AttendanceRegisterQuery } from "../api/attendance.api";

export function useAttendanceRegister(query: AttendanceRegisterQuery) {
  return useQuery({
    queryKey: queryKeys.attendance.register(
      query.timestamp,
      query.status,
      query.is_late,
      query.is_early_departure,
    ),
    queryFn: () => attendanceApi.register(query),
    placeholderData: (previous) => previous,
  });
}
