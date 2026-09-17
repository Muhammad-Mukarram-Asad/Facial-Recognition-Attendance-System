import type { NextRequest } from 'next/server';

import { RANGE_SCALE, type DashboardRange } from '@/features/dashboard/types';
import {
  BLACKLISTED_BY_CAMERA,
  hourlyCheckIns,
  STRANGERS_BY_CAMERA,
  weeklyPunctuality,
  WORKFORCE,
} from '@/server/data/seed';
// HIDDEN — leave management.
// import { getStore } from '@/server/lib/store';
import { handleRouteError, ok } from '@/server/lib/response';

/** Scales a per-camera breakdown so its counts still sum to `total` after rounding. */
function scaleBreakdown(items: Array<{ camera: string; count: number }>, scale: number, total: number) {
  const scaled = items.map((item) => Math.round(item.count * scale));
  const remainder = total - scaled.reduce((sum, count) => sum + count, 0);
  if (scaled.length > 0) scaled[0] += remainder;
  return items.map((item, index) => ({ camera: item.camera, count: Math.max(0, scaled[index]) }));
}

export async function GET(request: NextRequest) {
  try {
    const range = (request.nextUrl.searchParams.get('range') ?? '24h') as DashboardRange;
    const scale = RANGE_SCALE[range] ?? 1;

    // HIDDEN — leave management.
    // const store = getStore();
    // const pending = store.leave.filter((l) => l.status === 'Pending');
    const present = Math.round(WORKFORCE.present * scale);
    const onTime = Math.round(WORKFORCE.onTime * scale);
    const strangers = Math.round(WORKFORCE.strangersDetected * scale);
    const blacklisted = Math.round(WORKFORCE.blacklistedAttempts * scale);

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
      },
      absence: {
        total: WORKFORCE.total - present,
      },
      device: {
        enrolledFaces: WORKFORCE.enrolledFaces,
        gateCameras: WORKFORCE.gateCameras,
        matchAccuracy: WORKFORCE.matchAccuracy,
      },
      // DUMMY — replace with the strangers/watchlist feed once that API is integrated.
      security: {
        strangers,
        blacklisted,
        strangersByCamera: scaleBreakdown(STRANGERS_BY_CAMERA, scale, strangers),
        blacklistedByCamera: scaleBreakdown(BLACKLISTED_BY_CAMERA, scale, blacklisted),
      },
      // HIDDEN — leave management.
      // pendingLeave: {
      //   count: pending.length,
      //   overdue: pending.filter((l) => Date.parse(l.submittedAt) < Date.parse('2026-09-07')).length,
      //   oldest: '04 Sep 2026',
      // },
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
