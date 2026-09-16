import { Card } from '@/shared/ui';

import type { DashboardOverview } from '../types';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PresenceCard({ presence }: { presence: DashboardOverview['presence'] }) {
  const offset = CIRCUMFERENCE * (1 - presence.rate / 100);

  return (
    <Card padding="20px 22px" style={{ flexDirection: 'row', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 132, height: 132, flex: 'none' }}>
        <svg viewBox="0 0 120 120" style={{ width: 132, height: 132, transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--surface-sunken)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="url(#presenceRing)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE.toFixed(1)}
            strokeDashoffset={offset.toFixed(1)}
            style={{ transition: 'stroke-dashoffset 700ms var(--ease-out)' }}
          />
          <defs>
            <linearGradient id="presenceRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1FB4A2" />
              <stop offset="100%" stopColor="#2E52E0" />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)' }}>
            {presence.rate.toFixed(1)}%
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}
          >
            Present
          </span>
        </div>
      </div>

      <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>Presence right now</span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text-strong)',
          }}
        >
          {presence.present.toLocaleString()}
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-faint)' }}>
            {' '}
            / {presence.total.toLocaleString()}
          </span>
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
          {[
            { color: 'var(--success)', label: `${presence.onTime.toLocaleString()} on time` },
            { color: 'var(--warning)', label: `${presence.late} late` },
            { color: 'var(--priority-high)', label: `${presence.absent} absent` },
          ].map((item) => (
            <span
              key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-body)' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
