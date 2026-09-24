'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import { fetchCurrentUser } from '@/features/auth/store/authSlice';
import { fetchDepartments } from '@/features/departments/store/departmentsSlice';
import { fetchDesignations } from '@/features/designations/store/designationsSlice';

import { makeStore } from './store';

/**
 * Bootstraps session data on load. fetchCurrentUser rehydrates the
 * signed-in user from the token cookie (a no-op if there isn't one). Once
 * that confirms a session, fetchDepartments/fetchDesignations follow —
 * both require auth, and only need fetching once per session (a fresh
 * sign-in triggers them too, from useSignIn; their own `condition` guards
 * keep either path from double-fetching).
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(fetchCurrentUser()).then((action) => {
      if (fetchCurrentUser.fulfilled.match(action)) {
        store.dispatch(fetchDepartments());
        store.dispatch(fetchDesignations());
      }
    });
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
