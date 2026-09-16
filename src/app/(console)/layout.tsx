import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { ConsoleShell } from '@/features/shell/components/ConsoleShell';

/** Every signed-in route shares the guard, sidebar, topbar and notifications. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ConsoleShell>{children}</ConsoleShell>
    </AuthGuard>
  );
}
