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

/**
 * Full roster for the employees screen. Search filters a copy of `items`
 * and does not refetch. Opening the screen again loads the latest list.
 * Create, update, and delete also invalidate this cache.
 */
export function useAllEmployees() {
  return useQuery({
    queryKey: queryKeys.employees.directory(),
    queryFn: () => employeesApi.listAll(),
    staleTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() });
    },
  });
}
