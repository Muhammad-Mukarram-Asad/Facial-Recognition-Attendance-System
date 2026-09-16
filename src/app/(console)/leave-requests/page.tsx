import { redirect } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';

// HIDDEN — leave management is switched off for this release.
// The feature module under src/features/leave is intact; to bring it back,
// restore the nav item and PAGE_META entry in shared/config/routes.ts,
// re-enable the pending-leave card in DashboardView, and swap the redirect
// below for the original render.
//
// import type { Metadata } from 'next';
// import { LeaveView } from '@/features/leave/components/LeaveView';
//
// export const metadata: Metadata = { title: 'Leave requests — FaceTrack' };
//
// export default function LeaveRequestsPage() {
//   return <LeaveView />;
// }

/** Direct hits on the old URL land on the dashboard rather than a dead page. */
export default function LeaveRequestsPage() {
  redirect(ROUTES.dashboard);
}
