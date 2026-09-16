import { Card, CardHeader } from '@/shared/ui';

import type { DashboardOverview } from '../types';

const WIDTH = 620;
const HEIGHT = 176;
const TOP_PAD = 14;

/** Area + line chart of gate check-ins across the morning window. */
export function HourlyCheckInsChart({ data }: { data: DashboardOverview['hourlyCheckIns'] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const step = data.length > 1 ? WIDTH / (data.length - 1) : WIDTH;

  const points = data.map((point, i) => {
    const x = i * step;
    const y = TOP_PAD + (1 - point.count / max) * (HEIGHT - TOP_PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M${points.join(' L')}`;
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  const peak = data.reduce((best, d) => (d.count > best.count ? d : best), data[0]);

  return (
    <Card style={{ flex: '1 1 420px', gap: 16 }}>
      <CardHeader
        title="Check-ins by hour"
        meta={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
            {data[0]?.hour}:00 — {data[data.length - 1]?.hour}:00
          </span>
        }
      />
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 14}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart of check-ins per hour"
        style={{ width: '100%', height: 180, display: 'block' }}
      >
        {[10, 70, 130].map((y) => (
          <line key={y} x1="0" y1={y} x2={WIDTH} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
        ))}
        <line x1="0" y1={HEIGHT} x2={WIDTH} y2={HEIGHT} stroke="var(--border-default)" strokeWidth="1" />
        <path d={area} fill="url(#hourlyArea)" />
        <path
          d={line}
          fill="none"
          stroke="url(#hourlyLine)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1200"
          style={{ animation: 'ftDrawLine 1100ms var(--ease-out) both' }}
        />
        <defs>
          <linearGradient id="hourlyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(46,82,224,.22)" />
            <stop offset="100%" stopColor="rgba(46,82,224,0)" />
          </linearGradient>
          <linearGradient id="hourlyLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1FB4A2" />
            <stop offset="100%" stopColor="#2E52E0" />
          </linearGradient>
        </defs>
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-faint)',
        }}
      >
        {data.map((point) => (
          <span key={point.hour}>{point.hour}</span>
        ))}
      </div>
      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
        Peak {peak.hour}:00 — {peak.count} check-ins
      </span>
    </Card>
  );
}
