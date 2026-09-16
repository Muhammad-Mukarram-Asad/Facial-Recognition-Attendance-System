import type { Metadata } from 'next';

import { ProfileDirectory } from '@/features/profile/components/ProfileDirectory';

export const metadata: Metadata = { title: 'Employee profile — FaceTrack' };

export default function EmployeeProfileIndexPage() {
  return <ProfileDirectory />;
}
