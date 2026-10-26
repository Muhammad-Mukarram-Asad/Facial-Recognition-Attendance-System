'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Provider } from 'react-redux';

import { useSessionExpiry } from '@/features/auth/hooks/useSessionExpiry';
import { registerUnauthorizedHandler } from '@/features/auth/lib/force-sign-out';
import { readSavedSessionUser } from '@/features/auth/lib/saved-session';
import { addUser, clearUser, fetchCurrentUser } from '@/features/auth/store/authSlice';
import { ROUTES } from '@/shared/config/routes';
import { useAppDispatch } from '@/shared/store/hooks';
import { fetchDepartments } from '@/features/departments/store/departmentsSlice';
import { fetchDesignations } from '@/features/designations/store/designationsSlice';
import { fetchShifts } from '@/features/shifts/store/shiftsSlice';

import { makeStore } from './store';

/**
 * Bootstraps session data on load. A still-valid 1-hour session is restored
 * from the cache first, then fetchCurrentUser revalidates it. A network
 * blip keeps that cache; an expired or invalid token signs the user out.
 * Once a session is confirmed, departments, designations, and shifts follow.
 * All three require auth and only need fetching once per session (a fresh
 * sign-in triggers them too, from useSignIn; their own `condition` guards
 * keep either path from double-fetching).
 */
function SessionExpiry() {
  useSessionExpiry();
  return null;
}

/** Turns a rejected token into a sign-in redirect, including from the axios interceptor. */
function UnauthorizedRedirect() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    return registerUnauthorizedHandler(() => {
      dispatch(clearUser());
      queryClient.clear();
      router.replace(ROUTES.signIn);
    });
  }, [dispatch, queryClient, router]);

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
        store.dispatch(fetchShifts());
      }
    });
  }, [store]);

  return (
    <Provider store={store}>
      <UnauthorizedRedirect />
      <SessionExpiry />
      {children}
    </Provider>
  );
}
