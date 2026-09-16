import type { Paginated } from '@/shared/types';

export function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    total: items.length,
    page: safePage,
    pageSize: safeSize,
    pageCount: Math.max(1, Math.ceil(items.length / safeSize)),
  };
}
