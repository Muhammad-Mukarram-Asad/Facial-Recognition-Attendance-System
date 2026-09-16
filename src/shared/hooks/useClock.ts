'use client';

import { useEffect, useState } from 'react';

import { formatClock } from '@/shared/lib/format';

/**
 * Ticking topbar clock. Returns an empty string until mounted so
 * server and client markup agree on the first paint.
 */
export function useClock(): string {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}
