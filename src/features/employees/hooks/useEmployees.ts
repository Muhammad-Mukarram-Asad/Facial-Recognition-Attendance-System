'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { employeesApi } from '../api/employees.api';
import type { EmployeeQuery } from '../types';

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

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.create,
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
