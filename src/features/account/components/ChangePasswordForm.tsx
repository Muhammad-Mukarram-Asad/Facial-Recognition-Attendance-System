"use client";

import { useState } from "react";
import { toast } from "sonner";

import { toApiError } from "@/shared/api/client";
import { Button, Icon, TextField } from "@/shared/ui";
import type { TextFieldProps } from "@/shared/ui/TextField";

import { useChangeMyPassword } from "../hooks/useAccount";
import {
  changePasswordFormSchema,
  PASSWORD_MIN_LENGTH,
  type ChangePasswordFormValues,
} from "../types";

type Errors = Partial<Record<keyof ChangePasswordFormValues, string>>;

const EMPTY: ChangePasswordFormValues = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function PasswordField(props: Omit<TextFieldProps, "type" | "endAdornment">) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
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
          <Icon name={visible ? "eye-off" : "eye"} size={16} />
        </button>
      }
    />
  );
}

/** POST /api/v1/me/change-password */
export function ChangePasswordForm({
  onDone,
  onBusyChange,
}: {
  onDone: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [values, setValues] = useState<ChangePasswordFormValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const change = useChangeMyPassword();
  const saving = change.isPending;

  const set =
    (key: keyof ChangePasswordFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = changePasswordFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof ChangePasswordFormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    onBusyChange(true);
    change.mutate(
      { old_password: values.oldPassword, new_password: values.newPassword },
      {
        onSuccess: (message) => {
          toast.success(message || "Password changed");
          setValues(EMPTY);
          onDone();
        },
        onError: (error) => toast.error(toApiError(error).message),
        onSettled: () => onBusyChange(false),
      },
    );
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <PasswordField
        autoFocus
        label="Current password *"
        autoComplete="current-password"
        value={values.oldPassword}
        error={errors.oldPassword}
        disabled={saving}
        onChange={set("oldPassword")}
      />
      <PasswordField
        label="New password *"
        autoComplete="new-password"
        value={values.newPassword}
        error={errors.newPassword}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        disabled={saving}
        onChange={set("newPassword")}
      />
      <PasswordField
        label="Confirm new password *"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        disabled={saving}
        onChange={set("confirmPassword")}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 4,
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={onDone}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" icon="check" loading={saving}>
          Update password
        </Button>
      </div>
    </form>
  );
}
