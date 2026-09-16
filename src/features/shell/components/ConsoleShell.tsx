'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// HIDDEN — notification system. Restore with the bell in Topbar.
// import { NotificationPanel } from '@/features/notifications/components/NotificationPanel';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { Icon } from '@/shared/ui';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Application chrome for every signed-in route.
 *
 * The shell owns the viewport: it is exactly 100vh and never scrolls itself.
 * The sidebar stays pinned while only the content column scrolls, so
 * navigation is always reachable no matter how long a page gets.
 */
export function ConsoleShell({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // HIDDEN — notification system.
  // const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Derived, not stored: the drawer only exists on mobile, so widening the
  // viewport dismisses it without a reset effect.
  const showDrawer = drawerOpen && !isDesktop;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setDrawerOpen(false);
      // setNotificationsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        background: 'var(--surface-app)',
        display: 'flex',
        alignItems: 'stretch',
        gap: 14,
        padding: 14,
        boxSizing: 'border-box',
      }}
    >
      {isDesktop && (
        <div
          style={{
            width: 'var(--sidebar-width)',
            flex: 'none',
            height: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-inverse)',
          }}
        >
          <Sidebar />
        </div>
      )}

      {showDrawer && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'var(--scrim)',
            backdropFilter: 'var(--blur-glass)',
            animation: 'ftFade 160ms var(--ease-out) both',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 'min(84vw, 290px)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'ftSlideIn 220ms var(--ease-out) both',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              style={{
                position: 'absolute',
                right: 12,
                top: 14,
                zIndex: 2,
                width: 36,
                height: 36,
                borderRadius: 11,
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(255,255,255,.12)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="x" size={18} />
            </button>
            <Sidebar variant="drawer" onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* The only scroll container in the console. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar onOpenMenu={() => setDrawerOpen(true)} />
        <main style={{ paddingBottom: 28, animation: 'ftFade 240ms var(--ease-out) both' }}>{children}</main>
      </div>

      {/* HIDDEN — notification system.
      {notificationsOpen && <NotificationPanel onClose={() => setNotificationsOpen(false)} />}
      */}
    </div>
  );
}
