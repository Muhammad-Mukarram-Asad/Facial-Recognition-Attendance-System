'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge, Button, Card } from '@/shared/ui';

/** Kiosk capture preview — shows the scanning sweep until a photo is uploaded. */
export function FaceEnrollmentCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Revoke the object URL when it's replaced or the card unmounts.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    event.target.value = '';
  };

  const clearPhoto = () => {
    setPhotoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  };

  return (
    <Card padding={20} style={{ gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-strong)' }}>Face enrollment</h3>
        <Badge tone={photoUrl ? 'success' : 'warning'} dot>
          {photoUrl ? 'Photo uploaded' : 'No photo yet'}
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
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL, not a served asset.
          <img
            src={photoUrl}
            alt="Uploaded enrollment photo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <>
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
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="brand" size="sm" icon="upload" onClick={() => inputRef.current?.click()}>
          Upload photo
        </Button>
        {photoUrl && (
          <Button variant="secondary" size="sm" icon="trash" onClick={clearPhoto}>
            Remove
          </Button>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--text-faint)' }}>
        Templates are stored as vectors, not images. The uploaded photo is used only to generate the
        enrollment template.
      </p>
    </Card>
  );
}
