import { Badge } from '@/shared/ui';
import type { Tone } from '@/shared/types';

/** Workforce `employee_status` slug on a gate event. */
const STATUS_BADGES: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  blacklisted: { label: 'Blacklisted', tone: 'warning' },
  vip: { label: 'VIP', tone: 'high' },
};

export function isVipEvent(status: string | null | undefined): boolean {
  return status === 'vip';
}

/**
 * HR status of the person on a gate event. Strangers have no status, so
 * nothing renders for them; an unknown slug is shown as-is.
 */
export function EmployeeStatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const badge = STATUS_BADGES[status] ?? { label: status, tone: 'neutral' as Tone };
  return <Badge tone={badge.tone}>{badge.label}</Badge>;
}
