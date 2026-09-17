'use client';

import { useEffect, useRef, useState } from 'react';

export interface CounterProps {
  value: number;
  decimals?: number;
  duration?: number;
  delayMs?: number;
}

/** Counts up to `value` — from 0 on first mount, from the previous value on every
 *  later change (a range switch, a refetch). The initial stagger `delayMs` only
 *  applies to that first run, so later updates react immediately. */
export function Counter({ value, decimals = 0, duration = 900, delayMs = 0 }: CounterProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const from = fromRef.current;
    const delay = hasAnimated.current ? 0 : delayMs;
    hasAnimated.current = true;

    let raf = 0;
    const startTime = performance.now() + delay;

    const tick = (now: number) => {
      if (now < startTime) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (value - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else {
        setDisplay(value);
        fromRef.current = value;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delayMs]);

  return <>{decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString()}</>;
}
