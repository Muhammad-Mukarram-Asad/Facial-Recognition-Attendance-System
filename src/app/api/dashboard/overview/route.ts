import type { NextRequest } from 'next/server';

import { hourlyCheckIns, weeklyPunctuality, WORKFORCE } from '@/server/data/seed';
import { getStore } from '@/server/lib/store';
import { handleRouteError, ok } from '@/server/lib/response';

/** Wider ranges soften the daily spikes; keeps the range switcher meaningful. */
const RANGE_SCALE: Record<string, number> = { '24h': 1, '7d': 0.94, '30d': 0.89, '60d': 0.86 };

export async function GET(request: NextRequest) {
  try {
    const range = request.nextUrl.searchParams.get('range') ?? '24h';
    const scale = RANGE_SCALE[range] ?? 1;
    const store = getStore();

    const pending = store.leave.filter((l) => l.status === 'Pending');
    const present = Math.round(WORKFORCE.present * scale);
    const onTime = Math.round(WORKFORCE.onTime * scale);

    return ok({
      range,
      presence: {
        present,
        total: WORKFORCE.total,
        rate: Number(((present / WORKFORCE.total) * 100).toFixed(1)),
        onTime,
        late: present - onTime,
        absent: WORKFORCE.total - present,
      },
      workforce: {
        total: WORKFORCE.total,
        active: WORKFORCE.active,
        probation: WORKFORCE.probation,
      },
      absence: {
        total: WORKFORCE.total - present,
        unplanned: Math.round(WORKFORCE.unplannedAbsent * scale),
        onLeave: WORKFORCE.onLeave,
      },
      pendingLeave: {
        count: pending.length,
        overdue: pending.filter((l) => Date.parse(l.submittedAt) < Date.parse('2026-09-07')).length,
        oldest: '04 Sep 2026',
      },
      hourlyCheckIns: hourlyCheckIns.map((point) => ({
        ...point,
        count: Math.round(point.count * scale),
      })),
      weeklyPunctuality,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
