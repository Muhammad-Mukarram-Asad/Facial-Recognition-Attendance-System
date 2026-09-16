import { Icon } from '@/shared/ui';

/** Inline banner for a failed sign-in / sign-up round trip. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--priority-high-bg)',
        color: 'var(--priority-high)',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Icon name="triangle-alert" size={16} />
      {message}
    </div>
  );
}
