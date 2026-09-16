'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { queryKeys } from '@/shared/api/query-keys';
import { ROUTES } from '@/shared/config/routes';

import { authApi } from '../api/auth.api';
import { sessionStorageAdapter } from '../lib/session-storage';
import type { Session } from '../types';

/** Reads the persisted session. `isPending` guards the redirect in AuthGuard. */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async (): Promise<Session | null> => sessionStorageAdapter.read(),
    staleTime: Infinity,
  });
}

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (session) => {
      sessionStorageAdapter.save(session);
      queryClient.setQueryData(queryKeys.auth.session(), session);
      router.push(ROUTES.dashboard);
    },
  });
}

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
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    sessionStorageAdapter.clear();
    queryClient.clear();
    router.push(ROUTES.signIn);
  };
}
