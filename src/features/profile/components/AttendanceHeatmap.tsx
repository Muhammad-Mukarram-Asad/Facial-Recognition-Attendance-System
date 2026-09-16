import type { DayMark } from '@/shared/types';
import { Card, CardHeader } from '@/shared/ui';

const MARK_STYLE: Record<DayMark, { bg: string; dot: string; label: string }> = {
  present: { bg: 'rgba(23,169,123,.22)', dot: 'var(--success)', label: 'Present' },
  late: { bg: 'rgba(232,163,23,.28)', dot: 'var(--warning)', label: 'Late' },
  absent: { bg: 'rgba(229,72,77,.26)', dot: 'var(--priority-high)', label: 'Absent' },
  // HIDDEN — leave management.
  // leave: { bg: 'rgba(59,102,240,.22)', dot: 'var(--brand-blue-500)', label: 'Approved leave' },
};

const LEGEND: DayMark[] = ['present', 'late', 'absent' /* , 'leave' */];

export interface AttendanceHeatmapProps {
  history: DayMark[];
  label: string;
}

/** 30-day attendance grid on the employee profile. */
export function AttendanceHeatmap({ history, label }: AttendanceHeatmapProps) {
  return (
    <Card style={{ flex: '1 1 300px', gap: 14 }}>
      <CardHeader
        title="Last 30 days"
        meta={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>{label}</span>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 6 }}>
        {history.map((mark, index) => (
          <span
            key={index}
            title={`Day ${index + 1}: ${MARK_STYLE[mark].label}`}
            style={{ aspectRatio: '1', borderRadius: 8, background: MARK_STYLE[mark].bg }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
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
    </Card>
  );
}
