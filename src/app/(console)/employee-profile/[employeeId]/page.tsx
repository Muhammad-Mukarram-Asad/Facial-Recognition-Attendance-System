import type { Metadata } from 'next';

import { ProfileView } from '@/features/profile/components/ProfileView';

export const metadata: Metadata = { title: 'Employee profile — FaceTrack' };

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return <ProfileView employeeId={employeeId} />;
}
