import { Card, Skeleton, SkeletonRows } from '@/shared/ui';

import { PageToolbar, ToolbarSpacer } from './PageToolbar';

/**
 * Generic console page placeholder: toolbar, a row of stat cards and a main
 * panel. Shown by the (console) loading boundary so a sidebar click swaps the
 * content area immediately while the next page renders and fetches.
 */
export function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <PageToolbar>
        <Skeleton width={220} height={38} radius={10} />
        <ToolbarSpacer />
        <Skeleton width={120} height={38} radius={10} />
      </PageToolbar>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton width="45%" height={12} />
              <Skeleton width="65%" height={26} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Skeleton width={180} height={16} />
          <SkeletonRows rows={6} />
        </div>
      </Card>
    </div>
  );
}
