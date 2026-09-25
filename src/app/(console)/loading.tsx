import { PageSkeleton } from '@/features/shell/components/PageSkeleton';

/** Instant fallback for every console route; the shell (sidebar, topbar) stays mounted. */
export default function ConsoleLoading() {
  return <PageSkeleton />;
}
