'use client';

import type { ReactNode } from 'react';

import { APP_CONFIG } from '@/shared/config/app';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { Icon } from '@/shared/ui';

import { AuthBrandPanel } from './AuthBrandPanel';

/** Split-screen auth layout: brand panel on desktop, compact header on mobile. */
export function AuthShell({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        background: 'var(--surface-app)',
      }}
    >
      {isDesktop && <AuthBrandPanel />}

      <div
        style={{
          flex: '1 1 380px',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 22px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 404,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            animation: 'ftFadeUp 420ms var(--ease-out) both',
          }}
        >
          {!isDesktop && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'var(--gradient-brand)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flex: 'none',
                }}
              >
                <Icon name="scan-face" size={19} />
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-strong)' }}>
                {APP_CONFIG.brandName}
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
