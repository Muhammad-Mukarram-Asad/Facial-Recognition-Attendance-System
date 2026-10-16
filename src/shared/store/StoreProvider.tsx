'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import { useSessionExpiry } from '@/features/auth/hooks/useSessionExpiry';
import { readSavedSessionUser } from '@/features/auth/lib/saved-session';
import { addUser, fetchCurrentUser } from '@/features/auth/store/authSlice';
import { fetchDepartments } from '@/features/departments/store/departmentsSlice';
import { fetchDesignations } from '@/features/designations/store/designationsSlice';

import { makeStore } from './store';

/**
 * Bootstraps session data on load. A still-valid 1-hour session is restored
 * from the cache first, so a reload stays on the console even if GET /me
 * fails. fetchCurrentUser then revalidates when it can. Once that confirms
 * a session, fetchDepartments/fetchDesignations follow — both require auth,
 * and only need fetching once per session (a fresh sign-in triggers them
 * too, from useSignIn; their own `condition` guards keep either path from
 * double-fetching).
 */
function SessionExpiry() {
  useSessionExpiry();
  return null;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    const cached = readSavedSessionUser();
    if (cached) store.dispatch(addUser(cached));

    store.dispatch(fetchCurrentUser()).then((action) => {
      if (fetchCurrentUser.fulfilled.match(action)) {
        store.dispatch(fetchDepartments());
        store.dispatch(fetchDesignations());
      }
    });
  }, [store]);

  return (
    <Provider store={store}>
      <SessionExpiry />
      {children}
    </Provider>
  );
}
