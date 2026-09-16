'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { Avatar, Button, Card, CardHeader, SkeletonRows } from '@/shared/ui';

import { useRiskList } from '../hooks/useDashboard';

/** Employees whose attendance pattern needs a supervisor conversation. */
export function RiskListCard() {
  const router = useRouter();
  const { data, isPending } = useRiskList();

  return (
    <Card style={{ flex: '1 1 330px', gap: 12 }}>
      <CardHeader
        title="Attendance risk list"
        meta={
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}
          >
            Last 30 days
          </span>
        }
      />

      {isPending ? (
        <SkeletonRows rows={5} height={40} />
      ) : (
        data?.map((entry) => (
          <button
            key={entry.employeeId}
            type="button"
            onClick={() => router.push(ROUTES.profileFor(entry.employeeId))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              padding: 10,
              margin: '0 -10px',
              border: 'none',
              borderRadius: 12,
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Avatar name={entry.name} size={36} />
            <span style={{ flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {entry.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  color: 'var(--text-faint)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {entry.meta}
              </span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flex: 'none' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--priority-high)', letterSpacing: '-0.02em' }}>
                {entry.score}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>risk index</span>
            </span>
          </button>
        ))
      )}

      <Button
        variant="ghost"
        size="sm"
        icon="arrow-right"
        iconPosition="end"
        onClick={() => router.push(ROUTES.attendance)}
      >
        See all flagged employees
      </Button>
    </Card>
  );
}
