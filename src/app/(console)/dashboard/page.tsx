import type { Metadata } from 'next';

import { DashboardView } from '@/features/dashboard/components/DashboardView';

export const metadata: Metadata = { title: 'Dashboard — FaceTrack' };

export default function DashboardPage() {
  return <DashboardView />;
}
