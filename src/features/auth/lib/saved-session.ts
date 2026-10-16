import { AUTH_SESSION_TTL_MS, clearAuthToken, getAuthToken } from '@/shared/lib/auth-token';

import { authUserSchema, type AuthUser } from '../types';

const SAVED_SESSION_KEY = 'ft-auth-session';

type SavedSession = {
  user: AuthUser;
  expiresAt: number;
};

/**
 * Profile cached beside the token cookie. Redux is wiped on reload, and
 * GET /me can fail while the 1-hour cookie is still valid — this copy is
 * what keeps the console mounted across those reloads. Deadline is fixed
 * at sign-in; later profile refreshes must not push it forward.
 */
function readRaw(): SavedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SAVED_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: unknown; expiresAt?: unknown };
    const user = authUserSchema.safeParse(parsed.user);
    if (!user.success || typeof parsed.expiresAt !== 'number') return null;
    return { user: user.data, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function write(session: SavedSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_SESSION_KEY, JSON.stringify(session));
}

export function saveAuthSession(user: AuthUser): void {
  write({ user, expiresAt: Date.now() + AUTH_SESSION_TTL_MS });
}

export function updateSavedSessionUser(user: AuthUser): void {
  const existing = readRaw();
  const expiresAt =
    existing && existing.expiresAt > Date.now()
      ? existing.expiresAt
      : Date.now() + AUTH_SESSION_TTL_MS;
  write({ user, expiresAt });
}

export function getSavedSessionExpiresAt(): number | null {
  return readRaw()?.expiresAt ?? null;
}

/** User for the current cookie, or null once the hour has passed. */
export function readSavedSessionUser(): AuthUser | null {
  if (!getAuthToken()) {
    clearSavedSession();
    return null;
  }
  const session = readRaw();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    endAuthSession();
    return null;
  }
  return session.user;
}

export function clearSavedSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SAVED_SESSION_KEY);
}

export function endAuthSession(): void {
  clearAuthToken();
  clearSavedSession();
}
