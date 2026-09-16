'use client';

import { Button, Card, SkeletonRows } from '@/shared/ui';

import { useSavedReports } from '../hooks/useReports';

export function SavedReportsCard() {
  const { data, isPending } = useSavedReports();

  return (
    <Card padding={22} style={{ gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-strong)' }}>Saved reports</h3>

      {isPending ? (
        <SkeletonRows rows={3} height={36} />
      ) : (
        data?.map((report) => (
          <div
            key={report.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              padding: '12px 0',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                flex: '1 1 180px',
                minWidth: 0,
                fontSize: 13.5,
                color: 'var(--text-strong)',
                fontWeight: 600,
              }}
            >
              {report.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-faint)' }}>
              {report.format} · {report.size}
            </span>
            <Button variant="ghost" size="sm" icon="download">
              Download
            </Button>
          </div>
        ))
      )}
    </Card>
  );
}
