'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { fetchDepartments } from '@/features/departments/store/departmentsSlice';
import { fetchDesignations } from '@/features/designations/store/designationsSlice';
import { queryKeys } from '@/shared/api/query-keys';
import { ROUTES } from '@/shared/config/routes';
import { clearAuthToken, saveAuthToken } from '@/shared/lib/auth-token';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { authApi } from '../api/auth.api';
import { sessionStorageAdapter } from '../lib/session-storage';
import { addUser, clearUser } from '../store/authSlice';

/**
 * Backed by Redux + the `_ca` token cookie now, not react-query/sessionStorage
 * (see authSlice + shared/lib/auth-token). Returns the same `{ data, isPending }`
 * shape the old session-storage version did, so AuthGuard/Sidebar/Topbar —
 * which read `session?.user.name` etc. — didn't need to change.
 */
export function useSession() {
  const { user, status } = useAppSelector((state) => state.auth);
  return {
    data: user ? { user } : null,
    isPending: status === 'idle' || status === 'loading',
  };
}

export function useSignIn() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: ({ user, token }) => {
      saveAuthToken(token);
      dispatch(addUser(user));
      dispatch(fetchDepartments());
      dispatch(fetchDesignations());
      router.push(ROUTES.dashboard);
    },
  });
}

/**
 * Still mock-backed — sign-up is a hidden feature (accounts are provisioned
 * by the backend team, see SignInForm's copy) with no real endpoint given.
 * Left on the old sessionStorage session so it stays self-contained rather
 * than half-wiring it into the real auth/Redux flow above.
 */
export function useSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (session) => {
      sessionStorageAdapter.save(session);
      queryClient.setQueryData(queryKeys.auth.session(), session);
      router.push(ROUTES.dashboard);
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useSignOut() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearAuthToken();
    dispatch(clearUser());
    sessionStorageAdapter.clear();
    queryClient.clear();
    router.push(ROUTES.signIn);
  };
}
