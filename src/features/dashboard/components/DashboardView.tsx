'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageToolbar, ToolbarSpacer } from '@/features/shell/components/PageToolbar';
import { ROUTES } from '@/shared/config/routes';
import { Button, Card, SegmentedControl, Skeleton, StatCard } from '@/shared/ui';

import { useDashboardOverview } from '../hooks/useDashboard';
import { RANGE_OPTIONS, type DashboardRange } from '../types';
import { HourlyCheckInsChart } from './HourlyCheckInsChart';
import { LiveStreamCard } from './LiveStreamCard';
// HIDDEN — leave management.
// import { PendingLeaveCard } from './PendingLeaveCard';
import { PresenceCard } from './PresenceCard';
import { PunctualityChart } from './PunctualityChart';
// HIDDEN — attendance risk list.
// import { RiskListCard } from './RiskListCard';
import { StatusMatrixCard } from './StatusMatrixCard';

export function DashboardView() {
  const router = useRouter();
  const [range, setRange] = useState<DashboardRange>('24h');
  const { data, isPending, isError, refetch } = useDashboardOverview(range);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageToolbar>
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <SegmentedControl
            size="sm"
            ariaLabel="Date range"
            options={[...RANGE_OPTIONS]}
            value={range}
            onChange={(value) => setRange(value as DashboardRange)}
          />
        </div>
        <ToolbarSpacer />
        <Button variant="secondary" size="sm" icon="sliders-horizontal">
          Filters
        </Button>
        <Button size="sm" icon="download" onClick={() => router.push(ROUTES.reports)}>
          Export
        </Button>
      </PageToolbar>

      {isError ? (
        <Card padding="28px" style={{ alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-body)' }}>
            Could not load the dashboard.
          </span>
          <Button size="sm" icon="refresh-cw" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : isPending || !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={172} radius={14} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 14 }}>
            <Skeleton height={150} radius={14} />
            <Skeleton height={150} radius={14} />
            <Skeleton height={150} radius={14} />
          </div>
          <Skeleton height={320} radius={14} />
        </div>
      ) : (
        <>
          <PresenceCard presence={data.presence} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 14 }}>
            <StatCard
              label="Total employees"
              value={data.workforce.total.toLocaleString()}
              subs={[
                { label: 'Active', value: data.workforce.active.toLocaleString() },
                // HIDDEN — probation count.
                // { label: 'Probation', value: String(data.workforce.probation) },
              ]}
            />
            <StatCard
              label="Absent today"
              value={String(data.absence.total)}
              valueTone="high"
              subs={[
                { label: 'Unplanned', value: String(data.absence.unplanned), tone: 'high' },
                // HIDDEN — leave management.
                // { label: 'Leave', value: String(data.absence.onLeave), tone: 'medium' },
              ]}
            />
            {/* HIDDEN — leave management.
            <PendingLeaveCard pendingLeave={data.pendingLeave} />
            */}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch' }}>
            <HourlyCheckInsChart data={data.hourlyCheckIns} />
            <PunctualityChart data={data.weeklyPunctuality} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            {/* HIDDEN — attendance risk list.
            <RiskListCard />
            */}
            <LiveStreamCard />
          </div>

          <StatusMatrixCard />
        </>
      )}
    </div>
  );
}
