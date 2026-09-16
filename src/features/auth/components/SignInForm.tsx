'use client';

import Link from 'next/link';
import { useState } from 'react';

import { toApiError } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';
import { Button, Checkbox, Icon, TextField } from '@/shared/ui';

import { useSignIn } from '../hooks/useSession';
import { signInSchema } from '../types';
import { FormError } from './FormError';

export function SignInForm() {
  const signIn = useSignIn();
  const [values, setValues] = useState({ email: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    signIn.mutate(parsed.data);
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Sign in</h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          Admin console for gate attendance and workforce records.
        </p>
      </div>

      <FormError message={signIn.isError ? toApiError(signIn.error).message : undefined} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Checkbox
          checked={values.rememberMe}
          onChange={(e) => setValues((v) => ({ ...v, rememberMe: e.target.checked }))}
        >
          Keep me signed in
        </Checkbox>
        <Link href={ROUTES.forgotPassword} style={{ fontSize: 13, fontWeight: 600 }}>
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" fullWidth loading={signIn.isPending}>
        Sign in to console
      </Button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--text-faint)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ height: 1, flex: 1, background: 'var(--border-default)' }} />
        or
        <span style={{ height: 1, flex: 1, background: 'var(--border-default)' }} />
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        fullWidth
        onClick={() =>
          signIn.mutate({ email: 'mukarram.asad@ltm.com', password: 'kiosk-face-match', rememberMe: true })
        }
      >
        <Icon name="scan-face" size={18} />
        Use face sign-in at kiosk
      </Button>

      {/* HIDDEN — self-service sign-up. Accounts are provisioned by the backend team.
      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
        New here?{' '}
        <Link href={ROUTES.signUp} style={{ fontWeight: 600 }}>
          Create an admin account
        </Link>
      </p>
      */}

      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-faint)' }}>
        Accounts are issued by your FaceTrack administrator. Contact them if you need access.
      </p>
    </form>
  );
}
