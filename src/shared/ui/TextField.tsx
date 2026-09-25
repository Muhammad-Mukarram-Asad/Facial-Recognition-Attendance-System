'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  mono?: boolean;
  error?: string;
  hint?: string;
  /** Rendered inside the input, pinned to its right edge (e.g. a show/hide toggle). */
  endAdornment?: ReactNode;
}

export function TextField({ label, mono, error, hint, endAdornment, id, style, className, disabled, ...rest }: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <label htmlFor={inputId} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          className={`disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${className ?? ''}`}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: endAdornment ? '11px 40px 11px 12px' : '11px 12px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${error ? 'var(--priority-high)' : 'var(--border-default)'}`,
            background: disabled ? undefined : 'var(--surface-card)',
            color: disabled ? undefined : 'var(--text-strong)',
            fontSize: 14,
            fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
            outline: 'none',
            transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
            ...style,
          }}
          {...rest}
        />
        {endAdornment ? (
          <span style={{ position: 'absolute', top: 0, bottom: 0, right: 8, display: 'flex', alignItems: 'center' }}>
            {endAdornment}
          </span>
        ) : null}
      </div>
      {error ? (
        <span style={{ fontSize: 11.5, color: 'var(--priority-high)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{hint}</span>
      ) : null}
    </label>
  );
}
