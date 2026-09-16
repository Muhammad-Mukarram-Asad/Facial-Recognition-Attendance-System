import { Card, CardHeader } from '@/shared/ui';

import type { DashboardOverview } from '../types';

const LEGEND = [
  { color: 'var(--success)', label: 'On time' },
  { color: 'var(--warning)', label: 'Late' },
  { color: 'var(--priority-high)', label: 'Absent' },
];

/** Stacked bars: on-time / late / absent split for each day of the week. */
export function PunctualityChart({ data }: { data: DashboardOverview['weeklyPunctuality'] }) {
  return (
    <Card style={{ flex: '1 1 300px', gap: 16 }}>
      <CardHeader
        title="Punctuality this week"
        meta={<span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--success)' }}>+3.1%</span>}
      />

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 170 }}>
        {data.map((day, index) => (
          <div
            key={day.day}
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 6,
              height: '100%',
            }}
          >
            <div
              title={`${day.day}: ${day.onTime} on time, ${day.late} late, ${day.absent} absent`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transformOrigin: 'bottom',
                animation: `ftGrow ${520 + index * 40}ms var(--ease-out) both`,
              }}
            >
              <span style={{ height: day.onTime, borderRadius: '6px 6px 0 0', background: 'var(--success)' }} />
              <span style={{ height: day.late, background: 'var(--warning)' }} />
              <span style={{ height: day.absent, borderRadius: '0 0 6px 6px', background: 'var(--priority-high)' }} />
            </div>
            <span style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-faint)' }}>
              {day.day}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {LEGEND.map((item) => (
          <span
            key={item.label}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
