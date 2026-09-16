'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { reportsApi } from '../api/reports.api';
import type { ReportQuery } from '../types';

export function useAbsenceByDepartment(query: ReportQuery) {
  return useQuery({
    queryKey: queryKeys.reports.absenceByDepartment(query),
    queryFn: () => reportsApi.absenceByDepartment(query),
    placeholderData: (previous) => previous,
  });
}

export function useSavedReports() {
  return useQuery({
    queryKey: queryKeys.reports.saved(),
    queryFn: reportsApi.saved,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: reportsApi.export,
    onSuccess: (blob, variables) => {
      // Hand the generated file straight to the browser's download flow.
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${variables.type.toLowerCase().replace(/\s+/g, '-')}.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}
