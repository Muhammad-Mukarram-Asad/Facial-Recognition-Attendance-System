import type { ReactNode } from 'react';

import type { Tone } from '@/shared/types';

const TONES: Record<Tone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)', dot: 'var(--neutral-400)' },
  brand: { bg: 'var(--brand-indigo-100)', fg: 'var(--text-brand)', dot: 'var(--brand-indigo-600)' },
  accent: { bg: 'var(--brand-teal-100)', fg: 'var(--brand-teal-700)', dot: 'var(--brand-teal-500)' },
  success: { bg: 'var(--success-bg)', fg: 'var(--success)', dot: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', fg: '#a87208', dot: 'var(--warning)' },
  high: { bg: 'var(--priority-high-bg)', fg: 'var(--priority-high)', dot: 'var(--priority-high)' },
  medium: { bg: 'var(--priority-medium-bg)', fg: '#0284a8', dot: 'var(--priority-medium)' },
};

export interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', dot = false, children }: BadgeProps) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 'var(--radius-pill)',
        background: t.bg,
        color: t.fg,
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          aria-hidden
          style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot, flex: 'none' }}
        />
      )}
      {children}
    </span>
  );
}
