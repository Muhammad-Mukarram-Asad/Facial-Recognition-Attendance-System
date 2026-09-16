'use client';

import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly string[];
}

export function SelectField({ label, options, id, style, ...rest }: SelectFieldProps) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <label htmlFor={selectId} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</span>
      <select
        id={selectId}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-card)',
          color: 'var(--text-strong)',
          fontSize: 14,
          outline: 'none',
          ...style,
        }}
        {...rest}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
