'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { toneForStatus } from '@/shared/lib/status';
import { Avatar, Badge, Card, Checkbox, EmptyState } from '@/shared/ui';

import type { AttendancePage, AttendanceRow } from '../types';

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
          fontSize: 13,
          color: mono ? 'var(--text-strong)' : 'var(--text-body)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export interface AttendanceCardListProps {
  data: AttendancePage;
  selected: Set<string>;
  onToggle: (id: string) => void;
}

/** Mobile presentation: one card per employee instead of a squashed table. */
export function AttendanceCardList({ data, selected, onToggle }: AttendanceCardListProps) {
  const router = useRouter();

  if (data.items.length === 0) {
    return (
      <Card padding={0}>
        <EmptyState message="No attendance records match this search" icon="search-x" />
      </Card>
    );
  }

  const open = (row: AttendanceRow) => router.push(ROUTES.profileFor(row.employeeId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.items.map((row) => (
        <Card key={row.id} padding={14} style={{ gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Checkbox
              checked={selected.has(row.id)}
              onChange={() => onToggle(row.id)}
              aria-label={`Select ${row.name}`}
              style={{ width: 18, height: 18 }}
            />
            <Avatar name={row.name} size={44} brackets onClick={() => open(row)} />
            <div
              onClick={() => open(row)}
              style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer' }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-faint)' }}>
                {row.employeeId} · {row.serial}
              </span>
            </div>
            <Badge tone={toneForStatus(row.status)} dot>
              {row.status}
            </Badge>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
              gap: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Field label="Check in" value={row.checkIn} />
            <Field label="Check out" value={row.checkOut} />
            <Field label="Hours" value={row.hours} />
            <Field label="Role" value={row.designation} mono={false} />
          </div>
        </Card>
      ))}
    </div>
  );
}
