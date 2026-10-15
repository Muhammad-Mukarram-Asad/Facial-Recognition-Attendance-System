'use client';

import { useEffect, useRef } from 'react';
import { queryOptions, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventSourcePolyfill } from 'event-source-polyfill';

import { queryKeys } from '@/shared/api/query-keys';
import { getAuthToken } from '@/shared/lib/auth-token';

import { ATTENDANCE_STREAM_URL, parseStreamEvent } from '../api/attendance-stream.api';
import { streamEventKey, type AttendanceStreamEvent } from '../types';
import { isWithinLiveWindow, liveAttendanceEventsQuery } from './useLiveAttendanceEvents';

/** Wait this long before reconnecting after the stream drops or errors. */
const RECONNECT_INTERVAL_MS = 10_000;

/**
 * Treat the connection as dead if nothing arrives for this long. The server
 * sends `event: keepalive` every 15s when idle, and the polyfill counts any
 * incoming bytes as activity, so this only trips on a genuinely dead socket.
 */
const HEARTBEAT_TIMEOUT_MS = 120_000;

/** Whether the socket is currently open — cache-held so any component can read it. */
const connectionQuery = queryOptions<boolean>({
  queryKey: queryKeys.liveAttendance.connection(),
  queryFn: skipToken,
});

/**
 * Holds the one SSE connection to GET /api/v1/attendance/stream for the
 * whole signed-in session. Call it exactly once — AttendanceStreamConnection
 * does, from the console layout — so events are captured on every page, not
 * just the dashboard. Each event is written into the React Query cache
 * (liveAttendanceEventsQuery), which LiveStreamCard reads.
 */
export function useAttendanceStream({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the feed's cache entry observed for the whole session so it's never
  // garbage-collected while the user is on a page that doesn't show it.
  // notifyOnChangeProps: [] — this caller never renders the data.
  useQuery({ ...liveAttendanceEventsQuery, notifyOnChangeProps: [] });

  useEffect(() => {
    if (!enabled) return;

    // Stops a pending reconnect from firing after the effect is torn down.
    let destroyed = false;
    const setConnected = (connected: boolean) =>
      queryClient.setQueryData(connectionQuery.queryKey, connected);

    const connect = () => {
      if (destroyed) return;

      const token = getAuthToken();
      if (!token) return;

      const es = new EventSourcePolyfill(ATTENDANCE_STREAM_URL, {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: HEARTBEAT_TIMEOUT_MS,
      });

      es.onopen = () => setConnected(true);

      // Only unnamed `data:` frames land here; `event: keepalive` frames are
      // dispatched to their own (unused) event type and just keep the
      // heartbeat alive.
      es.onmessage = (message) => {
        let event: AttendanceStreamEvent | null;
        try {
          event = parseStreamEvent(JSON.parse(message.data));
        } catch {
          return;
        }
        if (!event) return;
        const incoming = event;

        // Exact key (not setQueriesData): creates the entry if nothing has
        // read it yet, e.g. signed in straight onto the employees page.
        // Frames have no id; dedupe on employee, time, type, and gate.
        queryClient.setQueryData(liveAttendanceEventsQuery.queryKey, (existing = []) => {
          const incomingKey = streamEventKey(incoming);
          if (existing.some((item) => streamEventKey(item) === incomingKey)) return existing;
          const now = Date.now();
          return [incoming, ...existing].filter((item) => isWithinLiveWindow(item, now));
        });

      };

      es.onerror = () => {
        // Drops are expected (network blips, server restarts, heartbeat
        // timeout) — close and retry quietly rather than treating it as fatal.
        es.close();
        eventSourceRef.current = null;
        setConnected(false);
        if (destroyed) return;
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connect();
        }, RECONNECT_INTERVAL_MS);
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnected(false);
    };
  }, [enabled, queryClient]);
}

/** Live/reconnecting state of the session-wide stream, for status badges. */
export function useAttendanceStreamStatus() {
  const { data: isConnected = false } = useQuery(connectionQuery);
  return { isConnected };
}
