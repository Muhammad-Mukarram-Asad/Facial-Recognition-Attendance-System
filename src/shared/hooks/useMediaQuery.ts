'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * SSR-safe media query hook.
 *
 * Uses useSyncExternalStore rather than an effect: matchMedia *is* an
 * external store, and this avoids the cascading render a setState-in-effect
 * would cause on mount.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // The server has no viewport; start narrow and let hydration correct it.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The design switches to the drawer layout at 900px. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 901px)');
}
