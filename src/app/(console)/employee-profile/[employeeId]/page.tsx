import type { Metadata } from 'next';

import { EmployeeDetailView } from '@/features/employees/components/EmployeeDetailView';

export const metadata: Metadata = { title: 'Edit employee — FaceTrack' };

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return <EmployeeDetailView employeeId={employeeId} />;
}
