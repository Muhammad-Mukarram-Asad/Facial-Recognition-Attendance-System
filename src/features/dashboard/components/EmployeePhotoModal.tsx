'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { formatClock, formatDate } from '@/shared/lib/format';
import { Avatar, Icon } from '@/shared/ui';

import { streamPhotoUrl } from '../api/attendance-stream.api';
import { eventLabel, gateLabel } from '../lib/event-label';
import type { AttendanceStreamEvent } from '../types';

export type EmployeePhotoPreview = {
  name: string;
  imagePath: string | null;
  headline: string;
  context: string;
  whenLabel: string;
  tone: 'success' | 'warning';
};

/** Live and recent cards share one caption shape with the attendance register. */
export function previewFromStreamEvent(event: AttendanceStreamEvent): EmployeePhotoPreview {
  const when = new Date(event.timestamp);
  return {
    name: event.employee_name || `Employee #${event.employee_id}`,
    imagePath: event.image_path,
    headline: eventLabel(event.event_type),
    context: gateLabel(event.location),
    whenLabel: `${formatDate(when)} · ${formatClock(when)}`,
    tone: event.event_type === 'exit' ? 'warning' : 'success',
  };
}

/**
 * Full employee photo, centered over the console. Opened from a thumbnail
 * in the live stream, the recent grid, or the attendance register.
 */
export function EmployeePhotoModal({
  preview,
  onClose,
}: {
  preview: EmployeePhotoPreview;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);

  const src = streamPhotoUrl(preview.imagePath);
  const name = preview.name;

  useEffect(() => {
    const onKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') onClose();
    };
    const blockScroll = (scrollEvent: Event) => {
      const target = scrollEvent.target;
      if (target instanceof Node && dialogRef.current?.contains(target)) return;
      scrollEvent.preventDefault();
    };
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    closeRef.current?.focus();
    document.addEventListener('keydown', onKey);
    document.addEventListener('wheel', blockScroll, { passive: false });
    document.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('wheel', blockScroll);
      document.removeEventListener('touchmove', blockScroll);
      previous?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--scrim)',
        backdropFilter: 'var(--blur-glass)',
        animation: 'ftFade 160ms var(--ease-out) both',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-photo-title"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 16,
          background: 'var(--surface-card)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-lg)',
          animation: 'ftFadeUp 200ms var(--ease-out) both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2
              id="employee-photo-title"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-strong)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </h2>
            <span style={{ fontSize: 13, fontWeight: 700, color: preview.tone === 'warning' ? 'var(--warning)' : 'var(--success)' }}>
              {preview.headline}
              {preview.context ? (
                <span style={{ fontWeight: 500, color: 'var(--text-body)' }}> · {preview.context}</span>
              ) : null}
            </span>
            {preview.whenLabel ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-faint)' }}>
                {preview.whenLabel}
              </span>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            style={{
              width: 36,
              height: 36,
              flex: 'none',
              borderRadius: 11,
              border: '1px solid var(--border-default)',
              background: 'var(--surface-card)',
              color: 'var(--text-strong)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div
          style={{
            borderRadius: 16,
            background: 'var(--surface-sunken)',
            minHeight: 280,
            maxHeight: 'min(68vh, 640px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {src && !failed ? (
            <img
              src={src}
              alt={`Photo of ${name}`}
              onError={() => setFailed(true)}
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: 'min(68vh, 640px)',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Avatar name={name} size={120} radius={28} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
