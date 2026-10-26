"use client";

import { useState } from "react";

import { toApiError } from "@/shared/api/client";
import { Button, Checkbox, TextField } from "@/shared/ui";

import { useSignIn } from "../hooks/useSession";
import { signInSchema } from "../types";
import { FormError } from "./FormError";
import { Eye, EyeOff } from "lucide-react";

export function SignInForm() {
  const signIn = useSignIn();
  const [values, setValues] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    signIn.mutate(parsed.data);
  };

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
      noValidate
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          Sign in
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
          Admin console for gate attendance and workforce records.
        </p>
      </div>

      <FormError
        message={signIn.isError ? toApiError(signIn.error).message : undefined}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="enter your password here"
          value={values.password}
          error={errors.password}
          onChange={(e) =>
            setValues((v) => ({ ...v, password: e.target.value }))
          }
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Checkbox
          checked={values.rememberMe}
          onChange={(e) =>
            setValues((v) => ({ ...v, rememberMe: e.target.checked }))
          }
        >
          Keep me signed in
        </Checkbox>
      </div>

      <Button type="submit" size="lg" fullWidth loading={signIn.isPending}>
        Sign in to console
      </Button>

      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--text-strong)",
        }}
      >
        Accounts are issued by your FaceTrack administrator. Contact them if you
        need access.
      </p>
    </form>
  );
}
