import { Card, CardHeader } from '@/shared/ui';

import type { EmployeeProfile } from '../types';

/** Gate events with a stand-in for the captured frame. */
export function RecentPunchesCard({ punches }: { punches: EmployeeProfile['punches'] }) {
  return (
    <Card style={{ flex: '1 1 300px', gap: 10 }}>
      <CardHeader
        title="Recent punches"
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
            Gate camera
          </span>
        }
      />

      {punches.map((punch, index) => (
        <div
          key={`${punch.kind}-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '9px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 44,
              height: 44,
              flex: 'none',
              borderRadius: 10,
              background: 'var(--surface-inverse-deep)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 8,
                top: 6,
                right: 8,
                bottom: 6,
                border: '1.5px solid rgba(229,72,77,.85)',
                borderRadius: 4,
              }}
            />
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{punch.kind}</span>
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
              {punch.camera}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              color: 'var(--text-body)',
              textAlign: 'right',
              flex: 'none',
            }}
          >
            {punch.time}
          </span>
        </div>
      ))}
    </Card>
  );
}
