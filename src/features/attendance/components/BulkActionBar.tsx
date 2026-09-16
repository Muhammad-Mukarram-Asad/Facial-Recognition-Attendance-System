'use client';

import { Button } from '@/shared/ui';

export interface BulkActionBarProps {
  count: number;
  onMarkPresent: () => void;
  onApproveLeave: () => void;
  onClear: () => void;
  pending?: boolean;
}

export function BulkActionBar({ count, onMarkPresent, onApproveLeave, onClear, pending }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        padding: '12px 16px',
        borderRadius: 14,
        background: 'var(--brand-indigo-100)',
        color: 'var(--text-brand)',
        animation: 'ftFadeUp 180ms var(--ease-out) both',
      }}
    >
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{count} selected</span>
      <span style={{ flex: 1, minWidth: 0 }} />
      <Button variant="secondary" size="sm" icon="check" onClick={onMarkPresent} loading={pending}>
        Mark present
      </Button>
      <Button variant="secondary" size="sm" icon="calendar-check" onClick={onApproveLeave} loading={pending}>
        Approve leave
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
