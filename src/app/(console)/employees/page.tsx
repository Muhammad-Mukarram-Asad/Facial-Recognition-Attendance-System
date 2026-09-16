import type { Metadata } from 'next';

import { EmployeesView } from '@/features/employees/components/EmployeesView';

export const metadata: Metadata = { title: 'Employees — FaceTrack' };

export default function EmployeesPage() {
  return <EmployeesView />;
}
