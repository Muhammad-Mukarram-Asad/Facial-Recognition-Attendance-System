import { WORKFORCE } from '@/server/data/seed';
import { handleRouteError, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';

export async function GET() {
  try {
    const store = getStore();
    const decided = store.leave.filter((request) => request.status !== 'Pending');

    return ok({
      pending: store.leave.filter((request) => request.status === 'Pending').length,
      // Baseline month-to-date figures plus anything decided in this session.
      approvedThisMonth: 86 + decided.filter((request) => request.status === 'Approved').length,
      rejected: 9 + decided.filter((request) => request.status === 'Rejected').length,
      onLeaveToday: WORKFORCE.onLeave,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
