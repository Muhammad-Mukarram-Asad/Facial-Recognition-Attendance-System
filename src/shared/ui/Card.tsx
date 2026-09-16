import type { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  padding?: number | string;
  style?: CSSProperties;
}

/** The elevated white surface every panel in the design sits on. */
export function Card({ children, padding = '20px 22px', style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  meta?: ReactNode;
}

export function CardHeader({ title, meta }: CardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-strong)' }}>{title}</h3>
      {meta}
    </div>
  );
}
