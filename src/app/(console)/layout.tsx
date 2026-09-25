import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { AttendanceStreamConnection } from '@/features/dashboard/components/AttendanceStreamConnection';
import { ConsoleShell } from '@/features/shell/components/ConsoleShell';

/**
 * Every signed-in route shares the guard, sidebar, topbar and notifications,
 * plus the one live attendance stream connection (so gate events are
 * captured on every page, not just the dashboard).
 */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AttendanceStreamConnection />
      <ConsoleShell>{children}</ConsoleShell>
    </AuthGuard>
  );
}
