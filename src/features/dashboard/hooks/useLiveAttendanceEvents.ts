'use client';

import { useEffect, useMemo, useState } from 'react';
import { queryOptions, skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import type { AttendanceStreamEvent } from '../types';

/** Rolling live window: events leave the feed once they're older than this. */
export const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** How often the window (and anything time-relative) re-evaluates with no new events. */
export const LIVE_CLOCK_TICK_MS = 30_000;

/** Stable fallback so the memo below doesn't recompute every render before the first event. */
const NO_EVENTS: AttendanceStreamEvent[] = [];

/**
 * The live feed's cache entry. The backend has no "today's events" snapshot
 * endpoint, so it never fetches (skipToken) — useAttendanceStream is its
 * only writer. That hook keeps an observer on it for the whole signed-in
 * session, so it's never garbage-collected while the console is open;
 * sign-out clears it with the rest of the cache (useSignOut → queryClient.clear()).
 */
export const liveAttendanceEventsQuery = queryOptions<AttendanceStreamEvent[]>({
  queryKey: queryKeys.liveAttendance.today(),
  queryFn: skipToken,
});

/** An unparseable timestamp is kept rather than silently dropped. */
export function isWithinLiveWindow(event: AttendanceStreamEvent, now: number): boolean {
  const time = Date.parse(event.timestamp);
  return Number.isNaN(time) || now - time < LIVE_WINDOW_MS;
}

/** Wall clock that ticks every LIVE_CLOCK_TICK_MS, so the 24h window keeps rolling on a quiet feed. */
export function useLiveClock(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), LIVE_CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/** The live feed (last 24h, newest first), read from the cache the stream writes into. */
export function useLiveAttendanceEvents() {
  const now = useLiveClock();
  const { data = NO_EVENTS } = useQuery(liveAttendanceEventsQuery);

  const events = useMemo(
    () => data.filter((event) => isWithinLiveWindow(event, now)),
    [data, now],
  );

  return { events, now };
}
