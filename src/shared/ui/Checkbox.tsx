'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: ReactNode;
  align?: 'center' | 'start';
}

export function Checkbox({ children, align = 'center', style, ...rest }: CheckboxProps) {
  const input = (
    <input
      type="checkbox"
      style={{
        width: 17,
        height: 17,
        flex: 'none',
        marginTop: align === 'start' ? 2 : 0,
        accentColor: 'var(--brand-indigo-700)',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    />
  );
  if (!children) return input;
  return (
    <label
      style={{
        display: 'flex',
        alignItems: align === 'start' ? 'flex-start' : 'center',
        gap: 9,
        fontSize: 13.5,
        lineHeight: 1.5,
        color: 'var(--text-body)',
        cursor: 'pointer',
      }}
    >
      {input}
      <span>{children}</span>
    </label>
  );
}
