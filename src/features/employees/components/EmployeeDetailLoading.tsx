import { Skeleton } from '@/shared/ui';

/**
 * Placeholder for the employee detail screen, laid out like the loaded view
 * (form, enrollment card; the back arrow lives in the Topbar). Used by the route's loading.tsx for
 * the instant navigation fallback, and by EmployeeDetailView while the
 * record itself is fetching — so the two hand off without a layout jump.
 */
export function EmployeeDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading employee"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}
    >
      <div style={{ flex: '1 1 460px', minWidth: 0 }}>
        <Skeleton height={520} radius={14} />
      </div>
      <div style={{ flex: '1 1 280px', minWidth: 0 }}>
        <Skeleton height={320} radius={14} />
      </div>
    </div>
  );
}
