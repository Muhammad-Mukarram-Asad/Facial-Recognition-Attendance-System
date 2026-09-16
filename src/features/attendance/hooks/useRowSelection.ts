'use client';

import { useCallback, useMemo, useState } from 'react';

/** Checkbox selection for the records table, scoped to the visible page. */
export function useRowSelection(visibleIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (visibleIds.length > 0 && visibleIds.every((id) => prev.has(id))) return new Set();
      return new Set(visibleIds);
    });
  }, [visibleIds]);

  const ids = useMemo(() => Array.from(selected), [selected]);

  return { selected, ids, count: selected.size, toggle, toggleAll, clear, allSelected };
}
