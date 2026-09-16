'use client';

import type { DayMark } from '@/shared/types';
import { Avatar, Card, CardHeader, SkeletonRows } from '@/shared/ui';

import { useStatusMatrix } from '../hooks/useDashboard';

// Working days only — no weekend columns.
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const MARK_STYLE: Record<DayMark, { bg: string; dot: string; label: string }> = {
  present: { bg: 'rgba(23,169,123,.16)', dot: 'var(--success)', label: 'Present' },
  late: { bg: 'rgba(232,163,23,.18)', dot: 'var(--warning)', label: 'Late' },
  absent: { bg: 'rgba(229,72,77,.16)', dot: 'var(--priority-high)', label: 'Absent' },
  // HIDDEN — leave management.
  // leave: { bg: 'rgba(59,102,240,.16)', dot: 'var(--brand-blue-500)', label: 'Approved leave' },
};

const LEGEND: DayMark[] = ['present', 'late', 'absent' /* , 'leave' */];

/** Per-employee week view. Scrolls horizontally rather than squashing on mobile. */
export function StatusMatrixCard() {
  const { data, isPending } = useStatusMatrix();

  return (
    <Card style={{ gap: 14 }}>
      <CardHeader
        title="Weekly status matrix"
        meta={
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {LEGEND.map((mark) => (
              <span
                key={mark}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: MARK_STYLE[mark].dot }} />
                {MARK_STYLE[mark].label}
              </span>
            ))}
          </div>
        }
      />

      {isPending ? (
        <SkeletonRows rows={6} height={30} />
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 600, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                paddingLeft: 186,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--text-faint)',
              }}
            >
              {DAYS.map((day) => (
                <span key={day} style={{ flex: 1, textAlign: 'center' }}>
                  {day}
                </span>
              ))}
            </div>

            {data?.map((row) => (
              <div key={row.employeeId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 178, flex: 'none', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar name={row.name} size={30} />
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--text-strong)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-faint)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.department}
                    </span>
                  </div>
                </div>

                {row.days.map((mark, index) => {
                  const style = MARK_STYLE[mark];
                  return (
                    <div
                      key={`${row.employeeId}-${DAYS[index]}`}
                      title={`${DAYS[index]}: ${style.label}`}
                      style={{
                        flex: 1,
                        height: 30,
                        minWidth: 0,
                        borderRadius: 8,
                        background: style.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: style.dot }} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
