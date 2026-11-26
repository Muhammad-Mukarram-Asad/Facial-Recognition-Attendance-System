"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useCan } from "@/features/auth/hooks/usePermission";
import { formatRoleName } from "@/features/auth/lib/role-label";
import { formatDate, initials, orDash } from "@/shared/lib/format";
import { Icon, SegmentedControl, Skeleton } from "@/shared/ui";

import { useMyProfile } from "../hooks/useAccount";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { EditProfileForm } from "./EditProfileForm";

type Tab = "overview" | "edit" | "password";

function memberSince(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDate(date);
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 12px",
        borderRadius: 12,
        background: "var(--surface-sunken)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-strong)",
          overflowWrap: "anywhere",
        }}
      >
        {orDash(value)}
      </span>
    </div>
  );
}

/** Signed-in profile: GET, PUT /api/v1/me and POST /api/v1/me/change-password. */
export function AccountProfileModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(busy);
  const canEdit = useCan("user.update.own");
  const { data: user, isPending, isError } = useMyProfile();

  const requestClose = () => {
    if (!busy) onClose();
  };

  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) onCloseRef.current();
    };
    closeRef.current?.focus();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div
      role="presentation"
      onClick={requestClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "var(--scrim)",
        backdropFilter: "var(--blur-glass)",
        animation: "ftFade 160ms var(--ease-out) both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
          maxHeight: "min(720px, calc(100dvh - 32px))",
          overflowY: "auto",
          padding: 20,
          background: "var(--surface-card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-lg)",
          animation: "ftFadeUp 200ms var(--ease-out) both",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            aria-hidden
            style={{
              width: 56,
              height: 56,
              flex: "none",
              borderRadius: 16,
              background: "var(--gradient-brand)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials(user?.name || "—")}
          </span>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <h2
              id={titleId}
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-strong)",
                overflowWrap: "anywhere",
              }}
            >
              {user?.name ?? "Your profile"}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label="Close profile"
            style={{
              width: 36,
              height: 36,
              flex: "none",
              borderRadius: 11,
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
              color: "var(--text-strong)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          {isPending ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton height={58} radius={12} />
              <Skeleton height={58} radius={12} />
              <Skeleton height={58} radius={12} />
            </div>
          ) : isError || !user ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              Profile details could not be loaded.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SegmentedControl
                size="sm"
                ariaLabel="Profile sections"
                value={tab}
                onChange={(next) => {
                  if (!busy) setTab(next as Tab);
                }}
                options={[
                  { value: "overview", label: "Overview" },
                  ...(canEdit
                    ? [{ value: "edit", label: "Edit profile" }]
                    : []),
                  { value: "password", label: "Password" },
                ]}
              />
              {tab === "edit" && canEdit ? (
                <EditProfileForm
                  user={user}
                  onDone={() => setTab("overview")}
                  onBusyChange={setBusy}
                />
              ) : tab === "password" ? (
                <ChangePasswordForm
                  onDone={() => setTab("overview")}
                  onBusyChange={setBusy}
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 8,
                  }}
                >
                  <Detail label="Email" value={user.email} />
                  <Detail
                    label="Role"
                    value={user.role ? formatRoleName(user.role.name) : ""}
                  />
                  <Detail
                    label="Status"
                    value={user.status ? "Active" : "Inactive"}
                  />
                  <Detail
                    label="Member since"
                    value={memberSince(user.created_at)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
