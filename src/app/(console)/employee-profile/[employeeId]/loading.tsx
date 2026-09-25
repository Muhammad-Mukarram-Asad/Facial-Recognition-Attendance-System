import { EmployeeDetailLoading } from '@/features/employees/components/EmployeeDetailLoading';

/**
 * The (console) fallback doesn't re-show here: list → detail stays inside the
 * already-mounted /employee-profile segment, so this route needs its own.
 */
export default function EmployeeDetailRouteLoading() {
  return <EmployeeDetailLoading />;
}
