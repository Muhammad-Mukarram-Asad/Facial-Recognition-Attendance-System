/** Two-letter monogram used by every avatar in the product. */
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

/** 12-hour clock with seconds, matching the topbar readout in the design. */
export function formatClock(date: Date): string {
  const hours = date.getHours();
  const hh = String(hours % 12 || 12).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss} ${hours < 12 ? 'am' : 'pm'}`;
}

/** Zero-padded serial number for table rows. */
export function serial(index: number): string {
  return String(index + 1).padStart(2, '0');
}

const NBSP_DASH = '—';

/** Attendance times are absent for non-present employees; render an em dash. */
export function orDash(value: string | null | undefined): string {
  return value && value.length > 0 ? value : NBSP_DASH;
}
