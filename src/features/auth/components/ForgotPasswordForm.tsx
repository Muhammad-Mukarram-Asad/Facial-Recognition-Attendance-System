'use client';

import Link from 'next/link';
import { useState } from 'react';

import { toApiError } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';
import { Button, Icon, TextField } from '@/shared/ui';

import { useForgotPassword } from '../hooks/useSession';
import { forgotPasswordSchema } from '../types';
import { FormError } from './FormError';

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    forgotPassword.mutate(parsed.data);
  };

  // Confirmation state — deliberately does not reveal whether the account exists.
  if (forgotPassword.isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="mail-check" size={22} />
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Check your inbox
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)' }}>
            If an account exists for{' '}
            <strong style={{ color: 'var(--text-strong)', fontWeight: 600 }}>
              {forgotPassword.data.email}
            </strong>
            , a reset link is on its way. It expires in 30 minutes.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-sunken)',
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-body)' }}>
            Nothing arrived?
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
            Check spam, or ask your administrator to confirm the address on file.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon="rotate-ccw" onClick={() => forgotPassword.reset()}>
            Use a different email
          </Button>
          <Link href={ROUTES.signIn} style={{ display: 'inline-flex' }}>
            <Button variant="ghost" icon="arrow-left">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
          Reset your password
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          Enter the work email on your FaceTrack account and we&apos;ll send a reset link.
        </p>
      </div>

      <FormError message={forgotPassword.isError ? toApiError(forgotPassword.error).message : undefined} />

      <TextField
        label="Work email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        error={error}
        onChange={(event) => setEmail(event.target.value)}
      />

      <Button type="submit" size="lg" fullWidth loading={forgotPassword.isPending}>
        Send reset link
      </Button>

      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
        Remembered it?{' '}
        <Link href={ROUTES.signIn} style={{ fontWeight: 600 }}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
