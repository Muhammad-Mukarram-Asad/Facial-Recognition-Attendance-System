'use client';

import { Card, CardHeader, SkeletonRows } from '@/shared/ui';

import { useAbsenceByDepartment } from '../hooks/useReports';
import type { ReportQuery } from '../types';

export function AbsenceByDepartmentCard({ query }: { query: ReportQuery }) {
  const { data, isPending } = useAbsenceByDepartment(query);

  return (
    <Card padding={22} style={{ gap: 16 }}>
      <CardHeader
        title="Absence by department"
        meta={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
            {query.from} — {query.to}
          </span>
        }
      />

      {isPending || !data ? (
        <SkeletonRows rows={5} height={22} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.map((row) => (
            <div key={row.department} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 120,
                  flex: 'none',
                  fontSize: 12.5,
                  color: 'var(--text-body)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.department}
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 12,
                  borderRadius: 6,
                  background: 'var(--surface-sunken)',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    height: '100%',
                    width: `${row.share}%`,
                    borderRadius: 6,
                    background: 'var(--gradient-brand)',
                    transition: 'width 500ms var(--ease-out)',
                  }}
                />
              </span>
              <span
                style={{
                  width: 44,
                  flex: 'none',
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12.5,
                  color: 'var(--text-strong)',
                }}
              >
                {row.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
