"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { AuthUser } from "@/features/auth/types";
import { toApiError } from "@/shared/api/client";
import { Button, TextField } from "@/shared/ui";

import { useUpdateMyProfile } from "../hooks/useAccount";
import {
  profileFormSchema,
  type ProfileFormValues,
  type UpdateProfileInput,
} from "../types";

type Errors = Partial<Record<keyof ProfileFormValues, string>>;

/** PUT /api/v1/me — name always, email only when it changed. */
export function EditProfileForm({
  user,
  onDone,
  onBusyChange,
}: {
  user: AuthUser;
  onDone: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [values, setValues] = useState<ProfileFormValues>({
    name: user.name,
    email: user.email,
  });
  const [errors, setErrors] = useState<Errors>({});
  const update = useUpdateMyProfile();
  const saving = update.isPending;

  const name = values.name.trim();
  const email = values.email.trim().toLowerCase();
  const emailChanged = email !== user.email.toLowerCase();
  const dirty = name !== user.name || emailChanged;

  const set =
    (key: keyof ProfileFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = profileFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof ProfileFormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    if (!dirty) {
      onDone();
      return;
    }

    const input: UpdateProfileInput = emailChanged ? { name, email } : { name };
    onBusyChange(true);
    update.mutate(input, {
      onSuccess: () => {
        toast.success("Profile updated");
        onDone();
      },
      onError: (error) => toast.error(toApiError(error).message),
      onSettled: () => onBusyChange(false),
    });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
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
        autoComplete="email"
        value={values.email}
        error={errors.email}
        hint={
          emailChanged
            ? "You'll use this email to sign in from now on."
            : undefined
        }
        disabled={saving}
        onChange={set("email")}
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
        <Button type="submit" icon="check" loading={saving} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
