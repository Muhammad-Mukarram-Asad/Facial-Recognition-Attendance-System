'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { fetchDepartments } from "@/features/departments/store/departmentsSlice";
import { fetchDesignations } from "@/features/designations/store/designationsSlice";
import { ROUTES } from "@/shared/config/routes";
import { saveAuthToken } from "@/shared/lib/auth-token";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

import { authApi } from "../api/auth.api";
import { allowFutureSignOut } from "../lib/force-sign-out";
import { endAuthSession, saveAuthSession } from "../lib/saved-session";
import { addUser, clearUser } from "../store/authSlice";

/**
 * Backed by Redux, the 1-hour `_ca` token cookie, and a cached profile
 * (see authSlice + saved-session). Returns the same `{ data, isPending }`
 * shape the old session-storage version did, so AuthGuard/Sidebar/Topbar —
 * which read `session?.user.name` etc. — didn't need to change.
 * A reload that already has a user is not pending, so the console stays up
 * while GET /me revalidates in the background.
 */
export function useSession() {
  const { user, status } = useAppSelector((state) => state.auth);
  return {
    data: user ? { user } : null,
    isPending: !user && (status === 'idle' || status === 'loading'),
  };
}

export function useSignIn() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: ({ user, token }) => {
      allowFutureSignOut();
      saveAuthToken(token);
      saveAuthSession(user);
      dispatch(addUser(user));
      dispatch(fetchDepartments());
      dispatch(fetchDesignations());
      router.push(ROUTES.dashboard);
    },
  });
}

export function useSignOut() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    endAuthSession();
    dispatch(clearUser());
    queryClient.clear();
    router.push(ROUTES.signIn);
  };
}
