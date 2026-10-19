'use client';

import { useState } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { formatClock } from '@/shared/lib/format';
import { Avatar, Card, CardHeader, EmptyState, Skeleton } from '@/shared/ui';

import { streamPhotoUrl } from '../api/attendance-stream.api';
import { useLiveAttendanceEvents } from '../hooks/useLiveAttendanceEvents';
import { streamEventKey, type AttendanceStreamEvent } from '../types';

const RECENT_LIMIT = 6;
const PHOTO_SIZE = 96;

/** "gate_01" → "Gate 01". A location without a number is shown as written. */
function gateLabel(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) return 'Gate —';
  const digits = trimmed.match(/(\d+)/);
  if (!digits) return trimmed.replace(/_/g, ' ');
  return `Gate ${digits[1]}`;
}

function eventLabel(eventType: string): string {
  const trimmed = eventType.trim();
  if (!trimmed) return 'Event';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * The six newest gate events, two per row, so HR can read them larger than
 * the scrolling live feed. "View all" opens the attendance records page.
 */
export function RecentAttendanceCard() {
  const isDesktop = useIsDesktop();
  const { events, isPending } = useLiveAttendanceEvents();
  const recent = events.slice(0, RECENT_LIMIT);

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {Array.from({ length: RECENT_LIMIT }, (_, index) => (
            <Skeleton key={index} height={120} radius={14} />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState message="No recent attendance yet" icon="scan-face" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {recent.map((event) => (
            <RecentEvent key={streamEventKey(event)} event={event} stacked={!isDesktop} />
          ))}
        </div>
      )}
    </Card>
  );
}

function RecentEvent({ event, stacked }: { event: AttendanceStreamEvent; stacked: boolean }) {
  const name = event.employee_name || `Employee #${event.employee_id}`;
  const isExit = event.event_type === 'exit';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        gap: stacked ? 10 : 14,
        minWidth: 0,
        padding: stacked ? 10 : 12,
        borderRadius: 14,
        background: 'var(--surface-subtle)',
      }}
    >
      <GatePhoto event={event} name={name} stacked={stacked} />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontSize: 15,
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
            fontSize: 13,
            fontWeight: 700,
            color: isExit ? 'var(--warning)' : 'var(--success)',
          }}
        >
          {eventLabel(event.event_type)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-body)' }}>{gateLabel(event.location)}</span>
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
  stacked,
}: {
  event: AttendanceStreamEvent;
  name: string;
  stacked: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = streamPhotoUrl(event.image_path);
  const size = stacked ? 112 : PHOTO_SIZE;

  if (!src || failed) {
    return (
      <Avatar
        name={name}
        size={size}
        radius={16}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        width: stacked ? '100%' : size,
        height: size,
        flex: 'none',
        borderRadius: 16,
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
}
