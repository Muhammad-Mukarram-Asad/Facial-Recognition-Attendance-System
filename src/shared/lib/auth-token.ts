import { deleteCookie, getCookie, setCookie } from './cookies';

/**
 * The auth token lives in a cookie (not Redux) so it survives reloads and
 * the axios interceptor can read it synchronously on every request. Named
 * `_ca` to match this app's sibling project's convention.
 * Fixed 1-hour lifetime from sign-in — reloads do not extend it.
 */
const AUTH_TOKEN_COOKIE = '_ca';
export const AUTH_SESSION_TTL_MS = 60 * 60 * 1000;

export function saveAuthToken(token: string): void {
  setCookie(AUTH_TOKEN_COOKIE, token, AUTH_SESSION_TTL_MS);
}

export function getAuthToken(): string | null {
  return getCookie(AUTH_TOKEN_COOKIE);
}

export function clearAuthToken(): void {
  deleteCookie(AUTH_TOKEN_COOKIE);
}
