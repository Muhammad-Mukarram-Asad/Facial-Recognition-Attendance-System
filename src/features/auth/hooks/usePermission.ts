"use client";

import { hasPermission } from "@/shared/config/permissions";
import { useAppSelector } from "@/shared/store/hooks";

/** True when the signed-in role includes this permission. */
export function useCan(permission: string): boolean {
  const granted = useAppSelector((state) => state.auth.user?.role.permissions);
  return hasPermission(granted, permission);
}
