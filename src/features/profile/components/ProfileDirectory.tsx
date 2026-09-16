'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { ROUTES } from '@/shared/config/routes';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Avatar, Card, EmptyState, Icon, SkeletonRows } from '@/shared/ui';

/**
 * Landing view for /employee-profile — the sidebar links here without an id,
 * so offer a picker rather than a dead end.
 */
export function ProfileDirectory() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const { data, isPending } = useEmployees({ search: debounced });

  return (
    <Card padding={22} style={{ gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Choose an employee
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
          Open a profile to see their 30-day attendance history and gate punches.
        </p>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-default)',
        }}
      >
        <Icon name="search" size={17} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or employee ID…"
          aria-label="Search employees"
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
      </label>

      {isPending ? (
        <SkeletonRows rows={6} height={44} />
      ) : data && data.items.length === 0 ? (
        <EmptyState message="No employees match that search" icon="search-x" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {data?.items.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => router.push(ROUTES.profileFor(employee.employeeId))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 10px',
                margin: '0 -10px',
                border: 'none',
                borderBottom: '1px solid var(--border-subtle)',
                borderRadius: 12,
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Avatar name={employee.name} size={38} brackets />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>
                  {employee.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-faint)' }}>
                  {employee.employeeId} · {employee.department}
                </span>
              </span>
              <Icon name="chevron-right" size={18} />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
