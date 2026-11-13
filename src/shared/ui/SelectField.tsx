'use client';

import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

import { Icon } from './Icon';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  /** A plain string list (value === label), or explicit {value, label}
   * pairs for options where the two differ (e.g. a numeric id vs. a name). */
  options: readonly string[] | readonly { value: string; label: string }[];
  error?: string;
  /** Keep the accessible name, but don't render a second visible label. */
  hideLabel?: boolean;
}

export function SelectField({
  label,
  options,
  id,
  style,
  className,
  disabled,
  error,
  hideLabel,
  ...rest
}: SelectFieldProps) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <label htmlFor={selectId} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      {hideLabel ? null : (
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</span>
      )}
      <div style={{ position: 'relative', minWidth: 0 }}>
        <select
          id={selectId}
          disabled={disabled}
          aria-label={hideLabel ? label : undefined}
          aria-invalid={error ? true : undefined}
          className={`disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${className ?? ''}`}
          style={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            padding: '11px 44px 11px 12px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${error ? 'var(--priority-high)' : 'var(--border-default)'}`,
            background: disabled ? undefined : 'var(--surface-card)',
            backgroundImage: 'none',
            color: disabled ? undefined : 'var(--text-strong)',
            fontSize: 14,
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
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
        <span
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: disabled ? 'var(--neutral-400)' : 'var(--text-muted)',
          }}
        >
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
      {error && <span style={{ fontSize: 11.5, color: 'var(--priority-high)' }}>{error}</span>}
    </label>
  );
}
