'use client';

import { Badge, Button, Card } from '@/shared/ui';

const ANGLES = ['Front', 'Left 30°', 'Right 30°'];

/** Kiosk capture preview with the scanning sweep from the design. */
export function FaceEnrollmentCard({ capturedAngles = 3 }: { capturedAngles?: number }) {
  return (
    <Card padding={20} style={{ gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-strong)' }}>Face enrollment</h3>
        <Badge tone={capturedAngles === 3 ? 'success' : 'warning'} dot>
          {capturedAngles} of 3 angles
        </Badge>
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          background: 'var(--surface-inverse-deep)',
          height: 176,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 18, borderRadius: 16, border: '1px dashed rgba(255,255,255,.28)' }} />
        <div
          style={{
            width: 92,
            height: 112,
            borderRadius: '46px 46px 38px 38px',
            background:
              'radial-gradient(120% 90% at 50% 25%, rgba(31,180,162,.34), rgba(46,82,224,.12) 60%, transparent 72%)',
            border: '1px solid rgba(255,255,255,.2)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            top: 20,
            height: 2,
            background: 'linear-gradient(90deg,transparent,var(--lucky-lime-400),transparent)',
            animation: 'ftScan 3s var(--ease-in-out) infinite',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 14,
            bottom: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(255,255,255,.72)',
          }}
        >
          enroll cam · 1280×720
        </span>
        <span
          style={{
            position: 'absolute',
            right: 14,
            bottom: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--lucky-lime-400)',
          }}
        >
          quality 0.94
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {ANGLES.map((angle, index) => (
          <div
            key={angle}
            style={{
              height: 60,
              borderRadius: 10,
              background: 'var(--surface-sunken)',
              border: `1px solid ${index < capturedAngles ? 'var(--brand-teal-500)' : 'var(--border-default)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: index < capturedAngles ? 'var(--text-accent)' : 'var(--text-faint)',
              fontWeight: index < capturedAngles ? 600 : 400,
            }}
          >
            {angle}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="brand" size="sm" icon="scan-face">
          Recapture
        </Button>
        <Button variant="secondary" size="sm" icon="upload">
          Upload photo
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--text-faint)' }}>
        Templates are stored as vectors, not images. Drop real employee photos in later — these frames
        are placeholders.
      </p>
    </Card>
  );
}
