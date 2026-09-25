'use client';

import { Avatar, Card, CardHeader, EmptyState, SkeletonRows } from '@/shared/ui';
import { formatClock } from '@/shared/lib/format';

import { useAttendanceStreamStatus } from '../hooks/useAttendanceStream';
import { useLiveAttendanceEvents } from '../hooks/useLiveAttendanceEvents';

/**
 * Rolling last-24h feed of gate matches — GET /api/v1/attendance/stream (SSE).
 * The connection lives in the console layout (AttendanceStreamConnection);
 * this card only reads the shared query cache, so events that arrived while
 * the user was on another page are already here.
 */
export function LiveStreamCard() {
  const { isConnected } = useAttendanceStreamStatus();
  const { events: data } = useLiveAttendanceEvents();
  // Skeleton only before the first connection when there's nothing cached to show.
  const isPending = !isConnected && data.length === 0;

  return (
    <Card style={{ flex: '1 1 330px', gap: 12 }}>
      <CardHeader
        title="Live clock-in stream"
        meta={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              background: isConnected ? 'var(--lucky-lime-100)' : 'var(--surface-subtle)',
              color: isConnected ? 'var(--lucky-lime-600)' : 'var(--text-faint)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isConnected ? 'var(--lucky-lime-500)' : 'var(--text-faint)',
                animation: isConnected ? 'ftPulse 2s infinite' : 'none',
              }}
            />
            {isConnected ? 'Live' : 'Reconnecting…'}
          </span>
        }
      />

      {isPending ? (
        <SkeletonRows rows={6} height={40} />
      ) : data.length === 0 ? (
        <EmptyState message="No gate activity yet" icon="scan-face" />
      ) : (
        // Uncapped (only age removes events), so scroll inside the card rather than growing it.
        <div style={{ maxHeight: 480, overflowY: 'auto', margin: '0 -4px', padding: '0 4px' }}>
          {data.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ position: 'relative', flex: 'none' }}>
                <Avatar name={event.employee_name || `Employee ${event.employee_id}`} size={36} />
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: -3,
                    bottom: -3,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'var(--surface-card)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
                </span>
              </span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-strong)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.employee_name || `Employee #${event.employee_id}`}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                    color: 'var(--text-faint)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.location}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flex: 'none' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 500, color: 'var(--text-body)' }}>
                  {formatClock(new Date(event.timestamp))}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: event.event_type === 'exit' ? 'var(--warning)' : 'var(--success)',
                  }}
                >
                  {event.event_type.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
