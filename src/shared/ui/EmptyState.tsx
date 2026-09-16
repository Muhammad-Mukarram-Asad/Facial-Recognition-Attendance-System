import { Icon } from './Icon';

export interface EmptyStateProps {
  message: string;
  icon?: string;
  hint?: string;
}

export function EmptyState({ message, icon = 'inbox', hint }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'var(--surface-sunken)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-faint)',
        }}
      >
        <Icon name={icon} size={22} />
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-body)' }}>{message}</span>
      {hint && <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{hint}</span>}
    </div>
  );
}
