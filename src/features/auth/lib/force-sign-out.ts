import { ROUTES } from '@/shared/config/routes';

import { endAuthSession } from './saved-session';

type UnauthorizedHandler = () => void;

let signingOut = false;
let handler: UnauthorizedHandler | null = null;

/** StoreProvider registers this so a rejected token can clear Redux and route to sign-in. */
export function registerUnauthorizedHandler(next: UnauthorizedHandler): () => void {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

/** A new sign-in should be able to sign out again if that token later fails. */
export function allowFutureSignOut(): void {
  signingOut = false;
}

/**
 * Ends the cookie session once and leaves the console.
 * Parallel 401s (every open request) only navigate a single time.
 */
export function forceSignOut(): void {
  if (typeof window === 'undefined' || signingOut) return;
  signingOut = true;
  endAuthSession();

  if (handler) {
    handler();
    return;
  }

  if (window.location.pathname !== ROUTES.signIn) {
    window.location.assign(ROUTES.signIn);
  }
}
