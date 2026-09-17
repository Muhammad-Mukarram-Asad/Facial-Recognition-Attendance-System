'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import type * as React from 'react';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={className}
        style={{
          zIndex: 50,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface-card)',
          boxShadow: 'var(--shadow-lg)',
          padding: 14,
          outline: 'none',
        }}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
