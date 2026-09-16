'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { ROUTES } from '@/shared/config/routes';

import { useSession } from '../hooks/useSession';

/**
 * Client-side guard for the console routes. Renders nothing until the
 * session resolves so protected content never flashes for a signed-out user.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace(ROUTES.signIn);
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-app)',
        }}
      >
        <span
          aria-label="Loading console"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid var(--border-default)',
            borderTopColor: 'var(--brand-blue-500)',
            animation: 'ftSpin 620ms linear infinite',
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
