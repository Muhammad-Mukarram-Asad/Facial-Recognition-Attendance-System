import type { Session } from '../types';

const TOKEN_KEY = 'facetrack.token';
const USER_KEY = 'facetrack.user';

/** Persisted client session. A production build would move this to an httpOnly cookie. */
export const sessionStorageAdapter = {
  save(session: Session): void {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },

  read(): Session | null {
    try {
      const token = window.localStorage.getItem(TOKEN_KEY);
      const user = window.localStorage.getItem(USER_KEY);
      if (!token || !user) return null;
      return { token, user: JSON.parse(user) as Session['user'] };
    } catch {
      return null;
    }
  },

  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
