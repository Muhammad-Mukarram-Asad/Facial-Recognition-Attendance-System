import { API_BASE_URL } from '@/shared/api/client';

import type { AttendanceStreamEvent } from '../types';

/**
 * Live gate feed. Consumed with EventSourcePolyfill (see useAttendanceStream),
 * since the native EventSource can't send the Authorization header.
 */
export const ATTENDANCE_STREAM_URL = `${API_BASE_URL}/attendance/stream`;

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
