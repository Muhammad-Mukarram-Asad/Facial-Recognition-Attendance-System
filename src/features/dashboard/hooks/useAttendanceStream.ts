'use client';

import { useEffect, useState } from 'react';

import { openAttendanceStream } from '../api/attendance-stream.api';
import type { AttendanceStreamEvent } from '../types';

/** Wait this long before reconnecting after the stream drops or errors —
 * matches the server's own 15s keepalive cadence closely enough that a
 * dropped connection is invisible in practice. */
const RECONNECT_DELAY_MS = 10_000;

/** How many of the most recent events to keep for the feed. */
const MAX_EVENTS = 20;

/**
 * Subscribes to GET /api/v1/attendance/stream (SSE) and keeps a rolling
 * feed of the most recent gate events. Holds one persistent connection —
 * reconnecting only if it drops — rather than re-polling on a timer, so
 * events still arrive the instant they happen.
 */
export function useAttendanceStream() {
  const [events, setEvents] = useState<AttendanceStreamEvent[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const connect = () => {
      openAttendanceStream(
        {
          onOpen: () => {
            setIsPending(false);
            setIsConnected(true);
          },
          onEvent: (event) => {
            setEvents((previous) => [event, ...previous].slice(0, MAX_EVENTS));
          },
        },
        controller.signal,
      )
        .catch(() => {
          // Network error, auth failure, or the connection was dropped —
          // either way, fall through to the reconnect below.
        })
        .finally(() => {
          if (cancelled) return;
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        });
    };

    connect();

    return () => {
      cancelled = true;
      controller.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return { data: events, isPending, isConnected };
}
