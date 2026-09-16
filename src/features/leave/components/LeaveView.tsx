'use client';

import { useState } from 'react';

import { Skeleton, StatCard } from '@/shared/ui';

import { useLeaveStats } from '../hooks/useLeave';
import type { LeaveFilter } from '../types';
import { LeaveQueue } from './LeaveQueue';

export function LeaveView() {
  const [filter, setFilter] = useState<LeaveFilter>('Pending');
  const { data: stats, isPending } = useLeaveStats();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
        {isPending || !stats ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={110} radius={14} />)
        ) : (
          <>
            <StatCard label="Pending approval" value={String(stats.pending)} valueTone="accent" />
            <StatCard label="Approved this month" value={String(stats.approvedThisMonth)} />
            <StatCard label="Rejected" value={String(stats.rejected)} />
            <StatCard label="On leave today" value={String(stats.onLeaveToday)} />
          </>
        )}
      </div>

      <LeaveQueue filter={filter} onFilterChange={setFilter} />
    </div>
  );
}
