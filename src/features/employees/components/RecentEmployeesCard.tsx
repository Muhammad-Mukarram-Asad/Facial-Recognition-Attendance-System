'use client';

import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';
import { Avatar, Card, Icon, SkeletonRows } from '@/shared/ui';

import { useDeleteEmployee, useRecentEmployees } from '../hooks/useEmployees';

const iconButton: React.CSSProperties = {
  width: 36,
  height: 36,
  flex: 'none',
  borderRadius: 11,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-card)',
  color: 'var(--text-muted)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export function RecentEmployeesCard() {
  const { data, isPending } = useRecentEmployees();
  const remove = useDeleteEmployee();

  return (
    <Card padding={20} style={{ gap: 10 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingBottom: 12,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-strong)' }}>Recently added</h3>
        <Link href={ROUTES.attendance} style={{ fontSize: 12.5, fontWeight: 600 }}>
          View all
        </Link>
      </div>

      {isPending ? (
        <SkeletonRows rows={5} height={38} />
      ) : (
        data?.items.map((employee) => (
          <div key={employee.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0' }}>
            <Avatar name={employee.name} size={34} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {employee.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
                {employee.employeeId}
              </span>
            </div>
            <Link
              href={ROUTES.profileFor(employee.employeeId)}
              aria-label={`Edit ${employee.name}`}
              style={iconButton}
            >
              <Icon name="pencil" size={15} />
            </Link>
            <button
              type="button"
              aria-label={`Delete ${employee.name}`}
              onClick={() => remove.mutate(employee.employeeId)}
              disabled={remove.isPending}
              style={iconButton}
            >
              <Icon name="trash-2" size={15} />
            </button>
          </div>
        ))
      )}
    </Card>
  );
}
