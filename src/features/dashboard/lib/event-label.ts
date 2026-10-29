/** "gate_01" → "Gate 01". A location without a number is shown as written. */
export function gateLabel(location: string): string {
  const trimmed = location.trim();
  if (!trimmed) return 'Gate —';
  const digits = trimmed.match(/(\d+)/);
  if (!digits) return trimmed.replace(/_/g, ' ');
  return `Gate ${digits[1]}`;
}

export function eventLabel(eventType: string): string {
  const trimmed = eventType.trim();
  if (!trimmed) return 'Event';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
