'use client';

import { EmployeeForm } from './EmployeeForm';
import { FaceEnrollmentCard } from './FaceEnrollmentCard';
import { RecentEmployeesCard } from './RecentEmployeesCard';

export function EmployeesView() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <EmployeeForm />
      <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FaceEnrollmentCard />
        <RecentEmployeesCard />
      </div>
    </div>
  );
}
