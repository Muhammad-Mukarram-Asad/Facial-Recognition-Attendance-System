import { getAuthToken } from '@/shared/lib/auth-token';

import type { AttendanceStreamEvent } from '../types';

/**
 * Real backend — same "explicit absolute URL, bypass the mock baseURL"
 * pattern used elsewhere (employees, auth, departments, designations).
 * EventSource can't carry a custom Authorization header, so this connects
 * via fetch + a manually-read ReadableStream instead.
 */
const ATTENDANCE_STREAM_URL =
  process.env.NEXT_PUBLIC_ATTENDANCE_STREAM_URL ??
  'http://localhost:8000/api/v1/attendance/stream';

/**
 * Opens one SSE connection and reads it until it closes, errors, or
 * `signal` aborts. Resolves normally when the stream ends — callers decide
 * whether/when to reconnect (see useAttendanceStream).
 */
export async function openAttendanceStream(
  handlers: {
    onOpen?: () => void;
    onEvent: (event: AttendanceStreamEvent) => void;
  },
  signal: AbortSignal,
): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(ATTENDANCE_STREAM_URL, {
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Attendance stream request failed (${response.status})`);
  }

  handlers.onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

    // SSE frames are separated by a blank line.
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const dataLines = frame
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim());

      // Comment-only frames (e.g. the server's 15s keepalive, sent as
      // ": keepalive") have no `data:` line — nothing to parse.
      if (dataLines.length > 0) {
        try {
          handlers.onEvent(JSON.parse(dataLines.join('\n')) as AttendanceStreamEvent);
        } catch {
          // Not JSON (e.g. a keepalive sent as a data frame) — ignore it.
        }
      }

      boundary = buffer.indexOf('\n\n');
    }
  }
}
