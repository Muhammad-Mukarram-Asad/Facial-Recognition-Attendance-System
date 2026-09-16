'use client';

import { useCallback, useState } from 'react';

import { REPORT_COLUMNS, REPORT_DEPARTMENTS, REPORT_TYPES, type ReportQuery } from '../types';
import { AbsenceByDepartmentCard } from './AbsenceByDepartmentCard';
import { ReportBuilder } from './ReportBuilder';
import { SavedReportsCard } from './SavedReportsCard';

const DEFAULT_QUERY: ReportQuery = {
  type: REPORT_TYPES[0],
  from: '01 / 09 / 2026',
  to: '09 / 09 / 2026',
  department: REPORT_DEPARTMENTS[0],
};

const DEFAULT_COLUMNS = new Set(REPORT_COLUMNS.filter((c) => c.default).map((c) => c.id as string));

export function ReportsView() {
  const [query, setQuery] = useState<ReportQuery>(DEFAULT_QUERY);
  const [columns, setColumns] = useState<Set<string>>(DEFAULT_COLUMNS);

  const onQueryChange = useCallback(
    (patch: Partial<ReportQuery>) => setQuery((prev) => ({ ...prev, ...patch })),
    [],
  );

  const onToggleColumn = useCallback((id: string) => {
    setColumns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <ReportBuilder
        query={query}
        onQueryChange={onQueryChange}
        columns={columns}
        onToggleColumn={onToggleColumn}
      />
      <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AbsenceByDepartmentCard query={query} />
        <SavedReportsCard />
      </div>
    </div>
  );
}
