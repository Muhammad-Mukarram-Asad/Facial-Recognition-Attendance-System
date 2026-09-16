import type { AttendanceStatus, Tone } from '@/shared/types';

/** Single source of truth for status → tone, so badges never drift between screens. */
export const STATUS_TONE: Record<AttendanceStatus, Tone> = {
  Present: 'success',
  Late: 'warning',
  Absent: 'high',
  'On Leave': 'medium',
};

export function toneForStatus(status: AttendanceStatus): Tone {
  return STATUS_TONE[status] ?? 'neutral';
}
