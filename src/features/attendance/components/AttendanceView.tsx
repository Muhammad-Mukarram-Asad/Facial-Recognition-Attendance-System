'use client';

import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { Button, Card, Skeleton } from '@/shared/ui';

import { useAttendanceList, useBulkUpdateAttendance } from '../hooks/useAttendance';
import { useAttendanceFilters } from '../hooks/useAttendanceFilters';
import { useRowSelection } from '../hooks/useRowSelection';
import { AttendanceCardList } from './AttendanceCardList';
import { AttendanceFilters } from './AttendanceFilters';
import { AttendanceTable } from './AttendanceTable';
import { BulkActionBar } from './BulkActionBar';

export function AttendanceView() {
  const isDesktop = useIsDesktop();
  const filters = useAttendanceFilters();
  const { data, isPending, isError, refetch } = useAttendanceList(filters.query);
  const bulkUpdate = useBulkUpdateAttendance();

  const visibleIds = data?.items.map((row) => row.id) ?? [];
  const selection = useRowSelection(visibleIds);

  const applyStatus = (status: string) => {
    bulkUpdate.mutate({ ids: selection.ids, status }, { onSuccess: selection.clear });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <AttendanceFilters
        search={filters.search}
        onSearchChange={filters.onSearchChange}
        column={filters.column}
        onColumnChange={filters.setColumn}
        status={filters.status}
        onStatusChange={filters.setStatus}
        resultLabel={`${data?.total ?? 0} results`}
      />

      <BulkActionBar
        count={selection.count}
        pending={bulkUpdate.isPending}
        onMarkPresent={() => applyStatus('Present')}
        onApproveLeave={() => applyStatus('On Leave')}
        onClear={selection.clear}
      />

      {isError ? (
        <Card padding="28px" style={{ alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-body)' }}>
            Could not load attendance records.
          </span>
          <Button size="sm" icon="refresh-cw" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : isPending || !data ? (
        <Skeleton height={420} radius={14} />
      ) : isDesktop ? (
        <AttendanceTable
          data={data}
          selected={selection.selected}
          allSelected={selection.allSelected}
          onToggle={selection.toggle}
          onToggleAll={selection.toggleAll}
          onPageChange={filters.setPage}
        />
      ) : (
        <AttendanceCardList data={data} selected={selection.selected} onToggle={selection.toggle} />
      )}
    </div>
  );
}
