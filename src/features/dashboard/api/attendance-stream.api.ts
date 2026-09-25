import type { AttendanceStreamEvent } from '../types';

/**
 * Real backend — same "explicit absolute URL, bypass the mock baseURL"
 * pattern used elsewhere (employees, auth, departments, designations).
 * Consumed with EventSourcePolyfill (see useAttendanceStream), since the
 * native EventSource can't send the Authorization header.
 */
export const ATTENDANCE_STREAM_URL =
  process.env.NEXT_PUBLIC_ATTENDANCE_STREAM_URL ??
  'http://localhost:8000/api/v1/attendance/stream';

/**
 * Each `data:` frame is one saved attendance event as a single JSON object.
 * Anything else (unexpected shape, missing `id`) is dropped rather than
 * rendered half-formed.
 */
export function parseStreamEvent(payload: unknown): AttendanceStreamEvent | null {
  if (!payload || typeof payload !== 'object') return null;
  const event = payload as Partial<AttendanceStreamEvent>;
  return typeof event.id === 'number' && typeof event.timestamp === 'string'
    ? (event as AttendanceStreamEvent)
    : null;
}
