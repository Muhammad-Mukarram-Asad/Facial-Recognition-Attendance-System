import { getValidated, API_BASE_URL } from '@/shared/api/client';

import {
  attendanceEventsResponseSchema,
  attendanceStreamEventSchema,
  type AttendanceStreamEvent,
} from '../types';

/**
 * Live gate feed. Consumed with EventSourcePolyfill (see useAttendanceStream),
 * since the native EventSource can't send the Authorization header.
 */
export const ATTENDANCE_STREAM_URL = `${API_BASE_URL}/attendance/stream`;

const SERVER_ASSETS_URL = process.env.NEXT_PUBLIC_SERVER_ASSETS?.replace(/\/$/, '') ?? '';

/** Prefix a gate `image_path` with the MinIO / server assets base. */
export function streamPhotoUrl(imagePath: string | null): string | null {
  if (!imagePath || !SERVER_ASSETS_URL) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${SERVER_ASSETS_URL}/${imagePath.replace(/^\//, '')}`;
}

/** GET /api/v1/attendance/events — newest first, rolling last 24 hours. */
export function fetchAttendanceEvents(): Promise<AttendanceStreamEvent[]> {
  return getValidated('/attendance/events', attendanceEventsResponseSchema).then(
    (response) => response.data.events,
  );
}

/**
 * Each `data:` frame is one JSON object with the six documented fields.
 * Keepalive frames have no body and never reach here. A frame missing
 * employee_id or timestamp is dropped.
 */
export function parseStreamEvent(payload: unknown): AttendanceStreamEvent | null {
  const parsed = attendanceStreamEventSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}
