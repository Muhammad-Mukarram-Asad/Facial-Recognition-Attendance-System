'use client';

import { useRouter } from 'next/navigation';

import { APP_CONFIG } from '@/shared/config/app';
import { ROUTES } from '@/shared/config/routes';
import { toneForStatus } from '@/shared/lib/status';
import { Avatar, Badge, Button, Checkbox, EmptyState } from '@/shared/ui';

import type { AttendancePage } from '../types';

const GRID =
  '42px 46px 56px minmax(160px,1.4fr) minmax(140px,1.1fr) minmax(110px,1fr) 92px 92px 74px 116px';

const HEADERS = [
  '#',
  'Face',
  'Employee',
  'Designation',
  'Department',
  'Check in',
  'Check out',
  'Hours',
  'Status',
];

export interface AttendanceTableProps {
  data: AttendancePage;
  selected: Set<string>;
  allSelected: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
}

/** Desktop presentation: a dense grid table with pagination. */
export function AttendanceTable({
  data,
  selected,
  allSelected,
  onToggle,
  onToggleAll,
  onPageChange,
}: AttendanceTableProps) {
  const router = useRouter();

  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 940 }}>
          <div
            role="row"
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 10,
              alignItems: 'center',
              padding: '13px 18px',
              background: 'var(--surface-sunken)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              <Checkbox checked={allSelected} onChange={onToggleAll} aria-label="Select all rows" />
            </span>
            {HEADERS.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>

          {data.items.length === 0 ? (
            <EmptyState
              message="No attendance records match this search"
              icon="search-x"
              hint="Try a different column or clear the status filter."
            />
          ) : (
            data.items.map((row) => (
              <div
                key={row.id}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  gap: 10,
                  alignItems: 'center',
                  padding: '11px 18px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span>
                  <Checkbox
                    checked={selected.has(row.id)}
                    onChange={() => onToggle(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
                  {row.serial}
                </span>
                <Avatar
                  name={row.name}
                  size={38}
                  brackets
                  onClick={() => router.push(ROUTES.profileFor(row.employeeId))}
                />
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.profileFor(row.employeeId))}
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-strong)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                  >
                    {row.name}
                  </button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-faint)' }}>
                    {row.employeeId}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13.5,
                    color: 'var(--text-body)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.designation}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    color: 'var(--text-body)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.department}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-strong)' }}>
                  {row.checkIn}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-strong)' }}>
                  {row.checkOut}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-body)' }}>
                  {row.hours}
                </span>
                <span>
                  <Badge tone={toneForStatus(row.status)} dot>
                    {row.status}
                  </Badge>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '13px 18px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Showing {data.items.length} of {data.rosterTotal.toLocaleString()} ·{' '}
          {APP_CONFIG.attendanceDateLabel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-left"
            disabled={data.page <= 1}
            onClick={() => onPageChange(data.page - 1)}
          >
            Prev
          </Button>
          {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === data.page ? 'page' : undefined}
              style={{
                padding: '5px 12px',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: page === data.page ? 700 : 500,
                background: page === data.page ? 'var(--interactive-primary)' : 'transparent',
                color: page === data.page ? '#fff' : 'var(--text-muted)',
              }}
            >
              {page}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-right"
            iconPosition="end"
            disabled={data.page >= data.pageCount}
            onClick={() => onPageChange(data.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
