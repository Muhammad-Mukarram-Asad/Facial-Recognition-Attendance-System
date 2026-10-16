'use client';

import { useEffect, useMemo, useState } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { getQueryClient } from '@/shared/api/query-client';
import { queryKeys } from '@/shared/api/query-keys';

import { fetchAttendanceEvents } from '../api/attendance-stream.api';
import { streamEventKey, type AttendanceStreamEvent } from '../types';

/** Rolling live window: events leave the feed once they're older than this. */
export const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** How often the window (and anything time-relative) re-evaluates with no new events. */
export const LIVE_CLOCK_TICK_MS = 30_000;

/** Stable fallback so the memo below doesn't recompute every render before the first event. */
const NO_EVENTS: AttendanceStreamEvent[] = [];

/** Newest first, duplicates dropped, events older than 24h removed. */
export function mergeAttendanceEvents(
  existing: AttendanceStreamEvent[],
  incoming: AttendanceStreamEvent[],
  now = Date.now(),
): AttendanceStreamEvent[] {
  const seen = new Set<string>();
  const merged: AttendanceStreamEvent[] = [];
  for (const event of [...incoming, ...existing]) {
    if (!isWithinLiveWindow(event, now)) continue;
    const key = streamEventKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(event);
  }
  return merged.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

/**
 * The live feed's cache entry. GET /api/v1/attendance/events seeds the last
 * 24 hours once per session; useAttendanceStream prepends frames that arrive
 * after that. Sign-out clears it with the rest of the cache.
 * The fetch merges with anything the stream already wrote, so a slow
 * snapshot cannot wipe a newer gate event.
 */
export const liveAttendanceEventsQuery = queryOptions<AttendanceStreamEvent[]>({
  queryKey: queryKeys.liveAttendance.today(),
  staleTime: Infinity,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const snapshot = await fetchAttendanceEvents();
    const existing =
      getQueryClient().getQueryData<AttendanceStreamEvent[]>(queryKeys.liveAttendance.today()) ?? [];
    return mergeAttendanceEvents(existing, snapshot);
  },
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

/** The live feed (last 24h, newest first): the events snapshot plus the stream. */
export function useLiveAttendanceEvents() {
  const now = useLiveClock();
  const { data = NO_EVENTS, isPending } = useQuery(liveAttendanceEventsQuery);

  const events = useMemo(
    () => data.filter((event) => isWithinLiveWindow(event, now)),
    [data, now],
  );

  return { events, now, isPending: isPending && events.length === 0 };
}
