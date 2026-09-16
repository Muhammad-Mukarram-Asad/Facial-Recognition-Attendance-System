import type { NextRequest } from 'next/server';

import { handleRouteError, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';

export async function GET(request: NextRequest) {
  try {
    const filter = request.nextUrl.searchParams.get('filter') ?? 'Pending';
    const store = getStore();

    const items = store.leave.filter((request) => {
      if (filter === 'Pending') return request.status === 'Pending';
      if (filter === 'Decided') return request.status !== 'Pending';
      return true;
    });

    return ok({ items, total: items.length });
  } catch (error) {
    return handleRouteError(error);
  }
}
