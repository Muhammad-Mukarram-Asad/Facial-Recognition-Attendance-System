'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { Button, Card, EmptyState } from '@/shared/ui';

import { useEmployeeDetail } from '../hooks/useEmployees';
import { EmployeeDetailLoading } from './EmployeeDetailLoading';
import { EmployeeForm } from './EmployeeForm';
import { FaceEnrollmentCard } from './FaceEnrollmentCard';

/**
 * Employee record screen — the same enrollment form as /employees, prefilled
 * for editing, with delete alongside it. Landed on from the employee list;
 * saving or deleting sends the admin back there with the roster refreshed.
 */
export function EmployeeDetailView({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const { data: employee, isPending, isError } = useEmployeeDetail(employeeId);

  const backToList = () => router.push(ROUTES.profile);

  if (isError) {
    return (
      <Card padding={0}>
        <EmptyState
          message="That employee could not be found"
          icon="user-round-x"
          hint="They may have been removed from the roster."
        />
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
          <Button size="sm" icon="arrow-left" onClick={backToList}>
            Back to employees
          </Button>
        </div>
      </Card>
    );
  }

  if (isPending || !employee) return <EmployeeDetailLoading />;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <EmployeeForm employee={employee} onSaved={backToList} onDeleted={backToList} />
      <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <FaceEnrollmentCard />
      </div>
    </div>
  );
}
