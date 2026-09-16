'use client';

import { useCallback, useMemo, useState } from 'react';

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import { DEFAULT_ATTENDANCE_QUERY, type AttendanceQuery, type SearchColumn, type StatusFilter } from '../types';

/**
 * Owns filter state for the records page and debounces the search term
 * so the query key only changes once the admin stops typing.
 */
export function useAttendanceFilters() {
  const [search, setSearch] = useState(DEFAULT_ATTENDANCE_QUERY.search);
  const [column, setColumnState] = useState<SearchColumn>(DEFAULT_ATTENDANCE_QUERY.column);
  const [status, setStatusState] = useState<StatusFilter>(DEFAULT_ATTENDANCE_QUERY.status);
  const [page, setPage] = useState(DEFAULT_ATTENDANCE_QUERY.page);

  const debouncedSearch = useDebouncedValue(search, 250);

  // Changing a filter must reset paging, or page 3 of the old result set sticks.
  const setColumn = useCallback((value: string) => {
    setColumnState(value as SearchColumn);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: string) => {
    setStatusState(value as StatusFilter);
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const query = useMemo<AttendanceQuery>(
    () => ({ search: debouncedSearch, column, status, page, pageSize: DEFAULT_ATTENDANCE_QUERY.pageSize }),
    [debouncedSearch, column, status, page],
  );

  return { search, onSearchChange, column, setColumn, status, setStatus, page, setPage, query };
}
