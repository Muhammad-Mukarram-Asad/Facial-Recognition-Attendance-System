import type { Metadata } from 'next';

import { RequirePermission } from '@/features/auth/components/RequirePermission';
import { EmployeesView } from '@/features/employees/components/EmployeesView';
import { PERMISSIONS } from '@/shared/config/permissions';

export const metadata: Metadata = { title: 'Add Employee — FaceTrack' };

export default function EmployeesPage() {
  return (
    <RequirePermission permission={PERMISSIONS.employeeCreate}>
      <EmployeesView />
    </RequirePermission>
  );
}
