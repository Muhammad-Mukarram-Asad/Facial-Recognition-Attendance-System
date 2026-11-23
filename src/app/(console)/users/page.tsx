import type { Metadata } from "next";

import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { UsersView } from "@/features/users/components/UsersView";
import { PERMISSIONS } from "@/shared/config/permissions";

export const metadata: Metadata = { title: "Users — FaceTrack" };

export default function UsersPage() {
  return (
    <RequirePermission permission={PERMISSIONS.userList}>
      <UsersView />
    </RequirePermission>
  );
}
