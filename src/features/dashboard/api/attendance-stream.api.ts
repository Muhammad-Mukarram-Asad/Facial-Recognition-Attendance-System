import { API_BASE_URL } from '@/shared/api/client';

import type { AttendanceStreamEvent } from '../types';

/**
 * Live gate feed. Consumed with EventSourcePolyfill (see useAttendanceStream),
 * since the native EventSource can't send the Authorization header.
 */
export const ATTENDANCE_STREAM_URL = `${API_BASE_URL}/attendance/stream`;

const SERVER_ASSETS_URL = process.env.NEXT_PUBLIC_SERVER_ASSETS?.replace(/\/$/, '') ?? '';

/** Prefix a gate `photo_path` with the MinIO / server assets base. */
export function streamPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath || !SERVER_ASSETS_URL) return null;
  if (/^https?:\/\//i.test(photoPath)) return photoPath;
  return `${SERVER_ASSETS_URL}/${photoPath.replace(/^\//, '')}`;
}

/**
 * Each `data:` frame is one JSON object with the six documented fields.
 * Keepalive frames have no body and never reach here. A frame missing
 * employee_id or timestamp is dropped.
 */
export function parseStreamEvent(payload: unknown): AttendanceStreamEvent | null {
  if (!payload || typeof payload !== 'object') return null;
  const event = payload as Partial<AttendanceStreamEvent>;
  if (typeof event.employee_id !== 'number' || typeof event.timestamp !== 'string') return null;
  return {
    employee_name: typeof event.employee_name === 'string' ? event.employee_name : '',
    employee_id: event.employee_id,
    timestamp: event.timestamp,
    location: typeof event.location === 'string' ? event.location : '',
    photo_path: typeof event.photo_path === 'string' && event.photo_path.length > 0 ? event.photo_path : null,
    event_type: typeof event.event_type === 'string' ? event.event_type : '',
  };
}
