import type { Tone } from '@/shared/types';

import { Card } from './Card';

const VALUE_TONE: Partial<Record<Tone, string>> = {
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  accent: 'var(--text-accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
};

export interface StatSub {
  label: string;
  value: string;
  tone?: Tone;
}

export interface StatCardProps {
  label: string;
  value: string;
  valueTone?: Tone;
  subs?: StatSub[];
}

export function StatCard({ label, value, valueTone, subs }: StatCardProps) {
  return (
    <Card padding="18px 20px" style={{ gap: 10, justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      <span
        style={{
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: (valueTone && VALUE_TONE[valueTone]) || 'var(--text-strong)',
        }}
      >
        {value}
      </span>
      {subs && subs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
          {subs.map((sub) => (
            <span key={sub.label} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {sub.label}{' '}
              <strong
                style={{
                  fontWeight: 700,
                  color: (sub.tone && VALUE_TONE[sub.tone]) || 'var(--text-body)',
                }}
              >
                {sub.value}
              </strong>
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
