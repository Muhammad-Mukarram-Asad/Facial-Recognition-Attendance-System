"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { updateSavedSessionUser } from "@/features/auth/lib/saved-session";
import { addUser } from "@/features/auth/store/authSlice";
import type { AuthUser } from "@/features/auth/types";
import { queryKeys } from "@/shared/api/query-keys";
import { useAppDispatch } from "@/shared/store/hooks";

import { accountApi } from "../api/account.api";
import type { ChangePasswordInput, UpdateProfileInput } from "../types";

/** Keeps Redux (sidebar, permissions), the cached session, and the query in step. */
function useSyncProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return (user: AuthUser) => {
    updateSavedSessionUser(user);
    dispatch(addUser(user));
    queryClient.setQueryData(queryKeys.auth.me(), user);
  };
}

export function useMyProfile() {
  const sync = useSyncProfile();
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await accountApi.get();
      sync(user);
      return user;
    },
  });
}

export function useUpdateMyProfile() {
  const sync = useSyncProfile();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => accountApi.update(input),
    onSuccess: sync,
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      accountApi.changePassword(input),
  });
}
