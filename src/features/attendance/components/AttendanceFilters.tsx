'use client';

import { APP_CONFIG } from '@/shared/config/app';
import { Button, Card, Icon, SegmentedControl } from '@/shared/ui';

import { SEARCH_COLUMNS, STATUS_FILTERS } from '../types';

export interface AttendanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  column: string;
  onColumnChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  resultLabel: string;
}

export function AttendanceFilters({
  search,
  onSearchChange,
  column,
  onColumnChange,
  status,
  onStatusChange,
  resultLabel,
}: AttendanceFiltersProps) {
  return (
    <Card padding="16px 18px" style={{ gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label
          style={{
            flex: '1 1 240px',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-default)',
            background: 'var(--surface-card)',
          }}
        >
          <Icon name="search" size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, ID, designation, status…"
            aria-label="Search attendance records"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              color: 'var(--text-strong)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              color: 'var(--text-faint)',
              whiteSpace: 'nowrap',
            }}
          >
            {resultLabel}
          </span>
        </label>
        <Button variant="secondary" size="sm" icon="calendar">
          {APP_CONFIG.attendanceDateLabel.split(' - ')[0]}
        </Button>
        <Button variant="secondary" size="sm" icon="download">
          CSV
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          Search in
        </span>
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <SegmentedControl
            size="sm"
            ariaLabel="Search column"
            options={[...SEARCH_COLUMNS]}
            value={column}
            onChange={onColumnChange}
          />
        </div>
        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <SegmentedControl
            size="sm"
            ariaLabel="Attendance status"
            options={[...STATUS_FILTERS]}
            value={status}
            onChange={onStatusChange}
          />
        </div>
      </div>
    </Card>
  );
}
