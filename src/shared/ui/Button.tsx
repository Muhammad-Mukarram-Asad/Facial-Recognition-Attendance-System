'use client';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'brand' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const SIZES: Record<ButtonSize, CSSProperties> = {
  sm: { height: 34, padding: '0 14px', fontSize: 13 },
  md: { height: 40, padding: '0 18px', fontSize: 14 },
  lg: { height: 46, padding: '0 22px', fontSize: 15 },
};

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--interactive-primary)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-xs)',
  },
  brand: {
    background: 'var(--gradient-brand)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-xs)',
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-strong)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-xs)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-body)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--priority-high)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-xs)',
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  fullWidth,
  loading,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 18 : 16;
  const glyph = loading ? (
    <span
      aria-hidden
      style={{
        width: iconSize,
        height: iconSize,
        flex: 'none',
        borderRadius: '50%',
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        animation: 'ftSpin 620ms linear infinite',
      }}
    />
  ) : icon ? (
    <Icon name={icon} size={iconSize} />
  ) : null;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      data-variant={variant}
      className="ft-button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        borderRadius: 'var(--radius-pill)',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        whiteSpace: 'nowrap',
        transition: 'transform var(--duration-fast) var(--ease-out), filter var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
        ...SIZES[size],
        ...VARIANTS[variant],
        ...style,
      }}
      {...rest}
    >
      {iconPosition === 'start' && glyph}
      {children}
      {iconPosition === 'end' && glyph}
    </button>
  );
}
