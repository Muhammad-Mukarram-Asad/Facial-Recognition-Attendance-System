import { handleRouteError, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';

function payload() {
  const store = getStore();
  return {
    items: store.notifications,
    unreadCount: store.notifications.filter((notification) => !notification.read).length,
  };
}

export async function GET() {
  try {
    return ok(payload());
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Mark-all-read from the panel footer. */
export async function PATCH() {
  try {
    const store = getStore();
    for (const notification of store.notifications) notification.read = true;
    return ok(payload());
  } catch (error) {
    return handleRouteError(error);
  }
}
