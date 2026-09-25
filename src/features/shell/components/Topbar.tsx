'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useSession } from '@/features/auth/hooks/useSession';
// HIDDEN — notification system.
// import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { PAGE_META, ROUTES } from '@/shared/config/routes';
import { useClock } from '@/shared/hooks/useClock';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { initials } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme/ThemeProvider';
import { Icon } from '@/shared/ui';

export interface TopbarProps {
  onOpenMenu: () => void;
  // HIDDEN — notification system.
  // onToggleNotifications: () => void;
}

function metaFor(pathname: string): { crumb: string; title: string; backHref?: string } {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // Profile detail routes carry an employee id segment, and step back to the list.
  if (pathname.startsWith(`${ROUTES.profile}/`)) {
    return { crumb: PAGE_META[ROUTES.profile].crumb, title: 'Employee details', backHref: ROUTES.profile };
  }
  return PAGE_META[ROUTES.dashboard];
}

const iconButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  flex: 'none',
  borderRadius: 12,
  border: '1px solid var(--border-default)',
  background: 'var(--surface-card)',
  color: 'var(--text-body)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background var(--duration-fast) var(--ease-out)',
};

export function Topbar({ onOpenMenu }: TopbarProps) {
  const pathname = usePathname();
  const clock = useClock();
  const isDesktop = useIsDesktop();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  // HIDDEN — notification system.
  // const { data: notifications } = useNotifications();

  const { crumb, title, backHref } = metaFor(pathname);
  // const unread = notifications?.unreadCount ?? 0;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        padding: '11px 14px',
        marginBottom: 16,
        borderRadius: 16,
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'var(--blur-glass)',
      }}
    >
      {!isDesktop && (
        <button type="button" onClick={onOpenMenu} aria-label="Open menu" style={iconButtonStyle}>
          <Icon name="menu" size={20} />
        </button>
      )}

      {backHref && (
        // In-app back: always the parent list, so it works even when the page was opened directly.
        <Link href={backHref} aria-label="Back to employees" title="Back to employees" style={iconButtonStyle}>
          <Icon name="arrow-left" size={20} />
        </Link>
      )}

      <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          {crumb}
        </span>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-strong)' }}>
          {title}
        </span>
      </div>

      {isDesktop && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-sunken)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-live)',
              animation: 'ftPulse 2s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              fontWeight: 500,
              color: 'var(--text-body)',
              minWidth: 92,
            }}
          >
            {clock || '—'}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        style={iconButtonStyle}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      </button>

      {/* HIDDEN — notification system.
      <button
        type="button"
        onClick={onToggleNotifications}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        style={{ ...iconButtonStyle, position: 'relative' }}
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 5,
              right: 4,
              minWidth: 17,
              height: 17,
              padding: '0 4px',
              boxSizing: 'border-box',
              borderRadius: 9,
              background: 'var(--priority-high)',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unread}
          </span>
        )}
      </button>
      */}


      <span
        aria-hidden
        style={{
          width: 42,
          height: 42,
          flex: 'none',
          borderRadius: 12,
          background: 'var(--gradient-brand)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {initials(session?.user.name ?? 'FaceTrack Admin')}
      </span>
    </header>
  );
}
