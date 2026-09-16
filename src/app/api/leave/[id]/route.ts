import type { NextRequest } from 'next/server';

import { badRequest, handleRouteError, notFound, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const { status } = (await request.json()) as { status: 'Approved' | 'Rejected' };

    if (status !== 'Approved' && status !== 'Rejected') {
      return badRequest('Status must be Approved or Rejected');
    }

    const store = getStore();
    const leaveRequest = store.leave.find((candidate) => candidate.id === id);
    if (!leaveRequest) return notFound('Leave request not found');

    leaveRequest.status = status;

    // Deciding a request clears the matching notification from the bell.
    const notification = store.notifications.find(
      (candidate) => candidate.kind === 'leave' && candidate.title.includes(leaveRequest.name),
    );
    if (notification) notification.read = true;

    // Respond with the Pending queue so the client list updates in place.
    const items = store.leave.filter((candidate) => candidate.status === 'Pending');
    return ok({ items, total: items.length });
  } catch (error) {
    return handleRouteError(error);
  }
}
