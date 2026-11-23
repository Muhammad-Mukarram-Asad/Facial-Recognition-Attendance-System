"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { toApiError } from "@/shared/api/client";
import { Button, Icon, SelectField, TextField } from "@/shared/ui";

import { formatRoleName } from "@/features/auth/lib/role-label";

import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { PASSWORD_RULE, userFormSchema, type ConsoleUser, type UserFormValues } from "../types";

export interface RoleOption {
  id: number;
  name: string;
}

const FALLBACK_ROLES: RoleOption[] = [
  { id: 1, name: "superadmin" },
  { id: 2, name: "viewer" },
];

export interface UserFormModalProps {
  user: ConsoleUser | null;
  roles: RoleOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormModal({ user, roles, onClose, onSaved }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const discovered = roles.length > 0 ? roles : FALLBACK_ROLES;
  const available =
    user?.roleId != null &&
    user.roleName &&
    !discovered.some((role) => role.id === user.roleId)
      ? [...discovered, { id: user.roleId, name: user.roleName }]
      : discovered;
  const defaultRoleId =
    available.find((role) => role.name === "viewer")?.id ?? available[0]?.id ?? 2;

  const [values, setValues] = useState<UserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    roleId: String(user?.roleId ?? defaultRoleId),
    password: "",
  });
  const selectedRoleId = available.some((role) => String(role.id) === values.roleId)
    ? values.roleId
    : String(defaultRoleId);

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const titleId = useId();
  const create = useCreateUser();
  const update = useUpdateUser();
  const saving = create.isPending || update.isPending;

  const closeRef = useRef(onClose);
  const savingRef = useRef(saving);
  useEffect(() => {
    closeRef.current = onClose;
    savingRef.current = saving;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingRef.current) closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const set =
    (key: keyof UserFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = userFormSchema.safeParse(values);
    const nextErrors: Partial<Record<keyof UserFormValues, string>> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof UserFormValues;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
    }
    if (!isEdit && !values.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (
      !isEdit &&
      values.password &&
      (values.password.length < 8 || !PASSWORD_RULE.test(values.password))
    ) {
      nextErrors.password =
        "Use at least 8 characters with an uppercase letter, a lowercase letter, and a number";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    const input = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      roleId: Number(selectedRoleId),
      password: values.password,
    };
    if (!Number.isInteger(input.roleId)) {
      setErrors({ roleId: "Role is required" });
      return;
    }

    if (isEdit && user) {
      update.mutate(
        { id: user.id, input },
        {
          onSuccess: () => {
            toast.success("User updated");
            onSaved();
          },
          onError: (error) => toast.error(toApiError(error).message),
        },
      );
      return;
    }

    create.mutate(input, {
      onSuccess: () => {
        toast.success("User created");
        onSaved();
      },
      onError: (error) => toast.error(toApiError(error).message),
    });
  };

  const title = isEdit ? "Edit user" : "Add user";

  return createPortal(
    <div
      role="presentation"
      onClick={() => {
        if (!saving) onClose();
      }}
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
          width: "min(480px, 100%)",
          padding: 20,
          background: "var(--surface-card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-lg)",
          animation: "ftFadeUp 200ms var(--ease-out) both",
        }}
      >
        <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
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
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <TextField
            autoFocus
            label="Name *"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            disabled={saving}
            onChange={set("name")}
          />
          <TextField
            label="Email *"
            type="email"
            autoComplete="off"
            value={values.email}
            error={errors.email}
            disabled={saving}
            onChange={set("email")}
          />
          <SelectField
            label="Role *"
            options={available.map((role) => ({
              value: String(role.id),
              label: formatRoleName(role.name),
            }))}
            value={selectedRoleId}
            error={errors.roleId}
            disabled={saving}
            onChange={set("roleId")}
          />
          {!isEdit && (
            <TextField
              label="Password *"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={values.password}
              error={errors.password}
              hint="At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
              disabled={saving}
              onChange={set("password")}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              }
            />
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" icon="check" loading={saving}>
              {isEdit ? "Save changes" : "Create user"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
