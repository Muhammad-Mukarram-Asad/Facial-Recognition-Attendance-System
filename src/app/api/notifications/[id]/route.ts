import type { NextRequest } from 'next/server';

import { handleRouteError, notFound, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(_request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const store = getStore();

    const notification = store.notifications.find((candidate) => candidate.id === id);
    if (!notification) return notFound('Notification not found');
    notification.read = true;

    return ok({
      items: store.notifications,
      unreadCount: store.notifications.filter((candidate) => !candidate.read).length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
