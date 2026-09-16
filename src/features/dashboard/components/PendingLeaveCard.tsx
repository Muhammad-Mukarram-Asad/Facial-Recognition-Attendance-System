'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { Button, Card } from '@/shared/ui';

import type { DashboardOverview } from '../types';

export function PendingLeaveCard({ pendingLeave }: { pendingLeave: DashboardOverview['pendingLeave'] }) {
  const router = useRouter();

  return (
    <Card padding="18px 20px" style={{ gap: 12, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>Pending leave</span>
        <span
          style={{
            minWidth: 26,
            height: 26,
            padding: '0 8px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--warning-bg)',
            color: '#a87208',
            fontSize: 13,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pendingLeave.count}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-body)' }}>
          {pendingLeave.overdue} waiting over 48 hours
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
          oldest: {pendingLeave.oldest}
        </span>
      </div>
      <Button variant="secondary" size="sm" onClick={() => router.push(ROUTES.leave)}>
        Review queue
      </Button>
    </Card>
  );
}
