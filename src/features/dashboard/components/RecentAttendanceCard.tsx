'use client';

import { useCallback, useState, type ReactNode } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';
import { useIsDesktop, useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { formatClock } from '@/shared/lib/format';
import { Avatar, Card, CardHeader, EmptyState, Skeleton } from '@/shared/ui';

import { streamPhotoUrl } from '../api/attendance-stream.api';
import { useLiveAttendanceEvents } from '../hooks/useLiveAttendanceEvents';
import { eventLabel, gateLabel } from '../lib/event-label';
import { streamEventKey, type AttendanceStreamEvent } from '../types';
import { EmployeePhotoModal, previewFromStreamEvent, type EmployeePhotoPreview } from './EmployeePhotoModal';

const DESKTOP_LIMIT = 12;
const COMPACT_LIMIT = 9;

/**
 * Newest gate events as a photo grid. Laptops and desktops show up to 12
 * across four columns. Narrower screens show up to 9, in three columns once
 * each face still has room, otherwise two, so the capture stays recognizable.
 * "View all" opens the attendance records page.
 */
export function RecentAttendanceCard() {
  const isDesktop = useIsDesktop();
  const isThreeUp = useMediaQuery('(min-width: 560px)');
  const { events, isPending } = useLiveAttendanceEvents();
  const [preview, setPreview] = useState<EmployeePhotoPreview | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);

  const limit = isDesktop ? DESKTOP_LIMIT : COMPACT_LIMIT;
  const columns = isDesktop ? 4 : isThreeUp ? 3 : 2;
  const recent = events.slice(0, limit);

  return (
    <Card style={{ gap: 14 }}>
      <CardHeader
        title="Recent attendance"
        meta={
          <Link href={ROUTES.attendance} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-brand)' }}>
            View all
          </Link>
        }
      />

      {isPending ? (
        <RecentGrid columns={columns}>
          {Array.from({ length: limit }, (_, index) => (
            <Skeleton key={index} height={220} radius={14} />
          ))}
        </RecentGrid>
      ) : recent.length === 0 ? (
        <EmptyState message="No recent attendance yet" icon="scan-face" />
      ) : (
        <RecentGrid columns={columns}>
          {recent.map((event) => (
            <RecentEvent key={streamEventKey(event)} event={event} onOpen={(next) => setPreview(previewFromStreamEvent(next))} />
          ))}
        </RecentGrid>
      )}

      {preview ? <EmployeePhotoModal preview={preview} onClose={closePreview} /> : null}
    </Card>
  );
}

function RecentGrid({ columns, children }: { columns: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function RecentEvent({
  event,
  onOpen,
}: {
  event: AttendanceStreamEvent;
  onOpen: (event: AttendanceStreamEvent) => void;
}) {
  const name = event.employee_name || `Employee #${event.employee_id}`;
  const isExit = event.event_type === 'exit';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: 14,
        background: 'var(--surface-subtle)',
        overflow: 'hidden',
      }}
    >
      <GatePhoto event={event} name={name} onOpen={() => onOpen(event)} />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 12px 12px' }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-strong)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: isExit ? 'var(--warning)' : 'var(--success)',
          }}
        >
          {eventLabel(event.event_type)}
        </span>
        <span
          style={{
            fontSize: 12.5,
            color: 'var(--text-body)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {gateLabel(event.location)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
          {formatClock(new Date(event.timestamp))}
        </span>
      </div>
    </div>
  );
}

function GatePhoto({
  event,
  name,
  onOpen,
}: {
  event: AttendanceStreamEvent;
  name: string;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const src = streamPhotoUrl(event.image_path);
  const canOpen = Boolean(src) && !failed;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        background: 'var(--surface-sunken)',
        overflow: 'hidden',
      }}
    >
      {canOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View photo of ${name}`}
          style={{
            position: 'absolute',
            inset: 0,
            padding: 0,
            border: 0,
            background: 'transparent',
            cursor: 'zoom-in',
            display: 'block',
          }}
        >
          <img
            src={src ?? undefined}
            alt=""
            onError={() => setFailed(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 18%',
              display: 'block',
            }}
          />
        </button>
      ) : (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Avatar name={name} size={72} radius={18} />
        </span>
      )}
    </div>
  );
}
