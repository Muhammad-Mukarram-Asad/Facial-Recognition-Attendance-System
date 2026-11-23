"use client";

import type { ReactNode } from "react";

import { Card, EmptyState } from "@/shared/ui";

import { useCan } from "../hooks/usePermission";

/**
 * Blocks a console page the signed-in role cannot use.
 * The API enforces the same permission; this keeps the screen from rendering.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const allowed = useCan(permission);

  if (!allowed) {
    return (
      <Card padding={0}>
        <EmptyState
          icon="shield-off"
          message="You don't have access to this page"
          hint="This section is limited to accounts with the required role."
        />
      </Card>
    );
  }

  return children;
}
