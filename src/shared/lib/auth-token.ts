import { deleteCookie, getCookie, setCookie } from './cookies';

/**
 * The auth token lives in a cookie (not Redux, not sessionStorage) so it
 * survives reloads without needing a rehydration dance, and so the axios
 * interceptor can read it synchronously on every request. Named `_ca` to
 * match this app's sibling project's convention. 1-day validity.
 */
const AUTH_TOKEN_COOKIE = '_ca';
const AUTH_TOKEN_TTL_DAYS = 1;

export function saveAuthToken(token: string): void {
  setCookie(AUTH_TOKEN_COOKIE, token, AUTH_TOKEN_TTL_DAYS);
}

export function getAuthToken(): string | null {
  return getCookie(AUTH_TOKEN_COOKIE);
}

export function clearAuthToken(): void {
  deleteCookie(AUTH_TOKEN_COOKIE);
}
