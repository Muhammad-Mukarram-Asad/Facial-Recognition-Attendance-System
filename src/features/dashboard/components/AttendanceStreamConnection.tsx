'use client';

import { useAttendanceStream } from '../hooks/useAttendanceStream';

/**
 * Opens the session-wide attendance stream. Mounted once in the console
 * layout so gate events keep arriving on every page (employees, reports…),
 * not only while the dashboard is open. Renders nothing.
 */
export function AttendanceStreamConnection() {
  useAttendanceStream();
  return null;
}
