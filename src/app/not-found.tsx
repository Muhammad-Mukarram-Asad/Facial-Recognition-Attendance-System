import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
        background: 'var(--surface-app)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-faint)' }}>404</span>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>
        That page is not on the roster
      </h1>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
        The link may be stale, or the record has been removed.
      </p>
      <Link
        href={ROUTES.dashboard}
        style={{
          marginTop: 8,
          padding: '11px 22px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--interactive-primary)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
