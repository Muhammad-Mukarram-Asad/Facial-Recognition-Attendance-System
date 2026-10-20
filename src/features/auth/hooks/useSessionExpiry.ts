'use client';

import { useEffect } from 'react';

import { useAppSelector } from '@/shared/store/hooks';

import { forceSignOut } from '../lib/force-sign-out';
import { getSavedSessionExpiresAt } from '../lib/saved-session';

/** Signs the user out when the 1-hour deadline is reached, including after
 * the tab has been backgrounded past that time. */
export function useSessionExpiry() {
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) return;

    const expiresAt = getSavedSessionExpiresAt();
    if (expiresAt === null) return;

    const logout = () => forceSignOut();

    if (expiresAt <= Date.now()) {
      logout();
      return;
    }

    const timer = window.setTimeout(logout, expiresAt - Date.now());
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() >= expiresAt) logout();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);
}
