'use client';

import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  /** A plain string list (value === label), or explicit {value, label}
   * pairs for options where the two differ (e.g. a numeric id vs. a name). */
  options: readonly string[] | readonly { value: string; label: string }[];
  error?: string;
}

export function SelectField({
  label,
  options,
  id,
  style,
  className,
  disabled,
  error,
  ...rest
}: SelectFieldProps) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <label htmlFor={selectId} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</span>
      <select
        id={selectId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={`disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${className ?? ''}`}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 12px',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? 'var(--priority-high)' : 'var(--border-default)'}`,
          background: disabled ? undefined : 'var(--surface-card)',
          color: disabled ? undefined : 'var(--text-strong)',
          fontSize: 14,
          outline: 'none',
          ...style,
        }}
        {...rest}
      >
        {options.map((option) =>
          typeof option === 'string' ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
      {error && <span style={{ fontSize: 11.5, color: 'var(--priority-high)' }}>{error}</span>}
    </label>
  );
}
