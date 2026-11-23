"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/features/auth/hooks/useSession";
import { useCan } from "@/features/auth/hooks/usePermission";
import { formatRoleName } from "@/features/auth/lib/role-label";
import { toApiError } from "@/shared/api/client";
import { PERMISSIONS } from "@/shared/config/permissions";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { initials } from "@/shared/lib/format";
import { Badge, Button, Card, EmptyState, Icon, SkeletonRows } from "@/shared/ui";

import { useDeleteUser, useUsers } from "../hooks/useUsers";
import type { ConsoleUser } from "../types";
import { UserFormModal, type RoleOption } from "./UserFormModal";

const PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 5;

function getPageWindow(current: number, total: number, size = MAX_PAGE_BUTTONS): number[] {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Super-admin directory for login accounts.
 * List, create, update, and delete each follow the matching user.* permission.
 */
export function UsersView() {
  const { data: session } = useSession();
  const canCreate = useCan(PERMISSIONS.userCreate);
  const canUpdate = useCan(PERMISSIONS.userUpdate);
  const canDelete = useCan(PERMISSIONS.userDelete);
  const remove = useDeleteUser();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [settledSearch, setSettledSearch] = useState(debouncedSearch);
  if (debouncedSearch !== settledSearch) {
    setSettledSearch(debouncedSearch);
    setPage(1);
  }
  const currentPage = debouncedSearch !== settledSearch ? 1 : page;

  const { data, isPending, isError, error, refetch } = useUsers({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const pageCount = Math.max(1, data?.totalPages ?? 1);
  if (data && data.totalPages > 0 && currentPage > data.totalPages && page !== data.totalPages) {
    setPage(data.totalPages);
  }

  const [knownRoles, setKnownRoles] = useState<RoleOption[]>([]);
  const roleSignature = (data?.users ?? [])
    .map((user) => `${user.roleId ?? ""}:${user.roleName ?? ""}`)
    .join("|");
  const [appliedRoleSignature, setAppliedRoleSignature] = useState("");
  if (data && roleSignature !== appliedRoleSignature) {
    setAppliedRoleSignature(roleSignature);
    setKnownRoles((current) => {
      const next = new Map(current.map((role) => [role.id, role.name]));
      for (const user of data.users) {
        if (user.roleId != null && user.roleName) next.set(user.roleId, user.roleName);
      }
      return [...next.entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.id - b.id);
    });
  }

  const [formUser, setFormUser] = useState<ConsoleUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const rangeStart = data && data.users.length > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const rangeEnd = data && data.users.length > 0 ? rangeStart + data.users.length - 1 : 0;

  const handleDelete = (user: ConsoleUser) => {
    toast.warning(`Delete ${user.name}?`, {
      id: `delete-user-${user.id}`,
      description: "They will no longer be able to sign in.",
      duration: Infinity,
      actionButtonStyle: {
        background: "var(--priority-high)",
        color: "#fff",
      },
      action: {
        label: "Delete",
        onClick: () => {
          remove.mutate(user.id, {
            onSuccess: () => toast.success("User deleted"),
            onError: (deleteError) => toast.error(toApiError(deleteError).message),
          });
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  return (
    <Card padding={22} style={{ gap: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Users
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
            Create accounts and assign Super admin or Viewer. Protected accounts cannot be deleted.
          </p>
        </div>
        {canCreate && (
          <Button
            icon="user-round-plus"
            onClick={() => {
              setFormUser(null);
              setFormOpen(true);
            }}
          >
            Add user
          </Button>
        )}
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border-default)",
        }}
      >
        <Icon name="search" size={17} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            color: "var(--text-strong)",
          }}
        />
      </label>

      {isPending ? (
        <SkeletonRows rows={6} height={44} />
      ) : isError ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <EmptyState
            message="Users could not be loaded"
            icon="shield-off"
            hint={toApiError(error).message}
          />
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : data && data.users.length === 0 ? (
        <EmptyState
          message={debouncedSearch ? "No users match that search" : "No users yet"}
          icon="search-x"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data?.users.map((user) => {
            const isSelf = user.id === session?.user.id;
            const showDelete = canDelete && user.isDeletable && !isSelf;
            return (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 4px",
                  borderBottom: "1px solid var(--border-subtle)",
                  flexWrap: "wrap",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    flex: "none",
                    borderRadius: 12,
                    background: "var(--gradient-brand)",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {initials(user.name)}
                </span>
                <span style={{ flex: "1 1 180px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{user.email}</span>
                </span>
                <Badge tone={user.roleName === "superadmin" ? "brand" : "neutral"}>
                  {formatRoleName(user.roleName)}
                </Badge>
                <Badge tone={user.status ? "success" : "high"} dot>
                  {user.status ? "Active" : "Inactive"}
                </Badge>
                {isSelf && <Badge tone="accent">You</Badge>}
                {!user.isDeletable && <Badge>Protected</Badge>}
                <span style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                  {canUpdate && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon="pencil"
                      onClick={() => {
                        setFormUser(user);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {showDelete && (
                    <Button
                      size="sm"
                      variant="danger"
                      icon="trash"
                      loading={remove.isPending && remove.variables === user.id}
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </Button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {data && data.total > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            paddingTop: 14,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{" "}
            {data.total.toLocaleString()}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Button
              variant="ghost"
              size="sm"
              icon="chevron-left"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Prev
            </Button>
            {getPageWindow(currentPage, pageCount).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPage(value)}
                aria-current={value === currentPage ? "page" : undefined}
                style={{
                  padding: "5px 12px",
                  border: "none",
                  borderRadius: "var(--radius-pill)",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: value === currentPage ? 700 : 500,
                  background: value === currentPage ? "var(--interactive-primary)" : "transparent",
                  color: value === currentPage ? "#fff" : "var(--text-muted)",
                }}
              >
                {value}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              icon="chevron-right"
              iconPosition="end"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {formOpen && (
        <UserFormModal
          key={formUser?.id ?? "create"}
          user={formUser}
          roles={knownRoles}
          onClose={() => setFormOpen(false)}
          onSaved={() => setFormOpen(false)}
        />
      )}
    </Card>
  );
}
