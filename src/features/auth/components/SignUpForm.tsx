'use client';

import Link from 'next/link';
import { useState } from 'react';

import { toApiError } from '@/shared/api/client';
import { ROUTES } from '@/shared/config/routes';
import { Button, Checkbox, TextField } from '@/shared/ui';

import { useSignUp } from '../hooks/useSession';
import { signUpSchema } from '../types';
import { FormError } from './FormError';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  employeeId: '',
  password: '',
  biometricConsent: false,
};

export function SignUpForm() {
  const signUp = useSignUp();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    signUp.mutate(parsed.data);
  };

  const set = (key: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: event.target.value }));

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-accent)',
            }}
          >
            Step 1 of 2
          </span>
          <span
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: 'var(--border-default)',
              overflow: 'hidden',
            }}
          >
            <span style={{ display: 'block', width: '50%', height: '100%', background: 'var(--gradient-brand)' }} />
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
          Create your account
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          Then enroll your face so the kiosk recognises you too.
        </p>
      </div>

      <FormError message={signUp.isError ? toApiError(signUp.error).message : undefined} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        <TextField
          label="First name"
          placeholder="Ayesha"
          value={values.firstName}
          error={errors.firstName}
          onChange={set('firstName')}
        />
        <TextField
          label="Last name"
          placeholder="Rahim"
          value={values.lastName}
          error={errors.lastName}
          onChange={set('lastName')}
        />
      </div>

      <TextField
        label="Work email"
        type="email"
        placeholder="you@company.com"
        value={values.email}
        error={errors.email}
        onChange={set('email')}
      />
      <TextField
        label="Employee ID"
        mono
        placeholder="LTM-00421"
        value={values.employeeId}
        error={errors.employeeId}
        onChange={set('employeeId')}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="At least 10 characters"
        value={values.password}
        error={errors.password}
        onChange={set('password')}
      />

      <Checkbox
        align="start"
        checked={values.biometricConsent}
        onChange={(e) => setValues((v) => ({ ...v, biometricConsent: e.target.checked }))}
      >
        I consent to biometric face templates being stored for attendance matching.
        {errors.biometricConsent && (
          <span style={{ display: 'block', marginTop: 4, fontSize: 11.5, color: 'var(--priority-high)' }}>
            {errors.biometricConsent}
          </span>
        )}
      </Checkbox>

      <Button type="submit" size="lg" fullWidth loading={signUp.isPending}>
        Continue to face enrollment
      </Button>

      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href={ROUTES.signIn} style={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
