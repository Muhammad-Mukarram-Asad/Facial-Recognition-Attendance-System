"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { employeesApi } from "../api/employees.api";
import type { EmployeeQuery, EmployeeWritePayload } from "../types";

export function useEmployees(query: EmployeeQuery = {}) {
  return useQuery({
    queryKey: queryKeys.employees.list(query),
    queryFn: () => employeesApi.list(query),
  });
}

export function useRecentEmployees(limit = 5) {
  return useQuery({
    queryKey: queryKeys.employees.recent(),
    queryFn: () => employeesApi.list({ limit }),
  });
}

export function useEmployeeDetail(employeeId: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(employeeId),
    queryFn: () => employeesApi.detail(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      photo,
    }: {
      input: EmployeeWritePayload;
      photo: File;
    }) => employeesApi.create(input, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      input,
    }: {
      employeeId: string;
      input: EmployeeWritePayload;
    }) => employeesApi.update(employeeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all() });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all() });
    },
  });
}
