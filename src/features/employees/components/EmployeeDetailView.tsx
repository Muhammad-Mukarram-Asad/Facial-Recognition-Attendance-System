"use client";

import { useRouter } from "next/navigation";

import { useCan } from "@/features/auth/hooks/usePermission";
import { PERMISSIONS } from "@/shared/config/permissions";
import { ROUTES } from "@/shared/config/routes";
import { Button, Card, EmptyState } from "@/shared/ui";

import { employeePhotoUrl } from "../api/employees.api";
import { toEmployeeStatusSlug } from "../types";
import { useEmployeeDetail } from "../hooks/useEmployees";
import { BlacklistNotice } from "./BlacklistNotice";
import { EmployeeDetailLoading } from "./EmployeeDetailLoading";
import { EmployeeForm } from "./EmployeeForm";
import { FaceEnrollmentCard } from "./FaceEnrollmentCard";

/**
 * Employee record screen — the same enrollment form as /employees.
 * Roles with employee.update can edit; roles with employee.delete can remove.
 * Everyone else sees the record with those controls hidden.
 */
export function EmployeeDetailView({ id }: { id: string }) {
  const router = useRouter();
  const canUpdate = useCan(PERMISSIONS.employeeUpdate);
  const canDelete = useCan(PERMISSIONS.employeeDelete);
  const { data: employee, isPending, isError } = useEmployeeDetail(id);

  const backToList = () => router.push(ROUTES.profile);

  if (isError) {
    return (
      <Card padding={0}>
        <EmptyState
          message="That employee could not be found"
          icon="user-round-x"
          hint="They may have been removed from the roster."
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 24,
          }}
        >
          <Button size="sm" icon="arrow-left" onClick={backToList}>
            Back to employees
          </Button>
        </div>
      </Card>
    );
  }

  if (isPending || !employee) return <EmployeeDetailLoading />;

  const blacklisted =
    toEmployeeStatusSlug(employee.employmentStatus) === "blacklisted";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {blacklisted ? (
        <BlacklistNotice reason={employee.blacklistReason} />
      ) : null}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <EmployeeForm
          employee={employee}
          readOnly={!canUpdate}
          canDelete={canDelete}
          onSaved={backToList}
          onDeleted={backToList}
        />
        <div
          style={{
            flex: "1 1 280px",
            minWidth: 0,
            minHeight: 0,
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FaceEnrollmentCard
            readOnly={!canUpdate}
            existingPhotoUrl={employeePhotoUrl(employee.photoPath)}
          />
        </div>
      </div>
    </div>
  );
}
