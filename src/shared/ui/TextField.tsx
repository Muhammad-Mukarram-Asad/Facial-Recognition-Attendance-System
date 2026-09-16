'use client';

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  mono?: boolean;
  error?: string;
  hint?: string;
}

export function TextField({ label, mono, error, hint, id, style, ...rest }: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <label htmlFor={inputId} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</span>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 12px',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? 'var(--priority-high)' : 'var(--border-default)'}`,
          background: 'var(--surface-card)',
          color: 'var(--text-strong)',
          fontSize: 14,
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
          outline: 'none',
          transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
          ...style,
        }}
        {...rest}
      />
      {error ? (
        <span style={{ fontSize: 11.5, color: 'var(--priority-high)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{hint}</span>
      ) : null}
    </label>
  );
}
