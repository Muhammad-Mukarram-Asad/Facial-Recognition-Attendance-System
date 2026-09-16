import { APP_CONFIG } from '@/shared/config/app';
import { Icon } from '@/shared/ui';

const HIGHLIGHTS = [
  { value: '99.2%', label: 'Match accuracy' },
  { value: '1,300', label: 'Enrolled faces' },
  { value: '6', label: 'Gate cameras' },
];

/** The indigo marketing half of the auth split-screen. */
export function AuthBrandPanel() {
  return (
    <div
      style={{
        flex: '1 1 420px',
        minWidth: 0,
        height: '100vh',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: 'var(--gradient-panel)',
        color: 'var(--text-on-inverse)',
        padding: '44px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {APP_CONFIG.brandName}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-on-inverse-muted)',
            paddingLeft: 10,
            borderLeft: '1px solid rgba(255,255,255,.18)',
          }}
        >
          {APP_CONFIG.tagline}
        </span>
      </div>

      <div
        style={{
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          animation: 'ftFadeUp 500ms var(--ease-out) both',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.12,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            textWrap: 'pretty',
          }}
        >
          Attendance that records itself.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15.5,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,0.78)',
            textWrap: 'pretty',
          }}
        >
          Faces are matched at the gate in under 300&nbsp;ms. Punctuality, absence and shift
          compliance land on your dashboard before the shift starts.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {HIGHLIGHTS.map((item) => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{item.value}</span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-on-inverse-muted)',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
