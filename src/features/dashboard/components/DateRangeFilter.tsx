'use client';

import { useState } from 'react';

import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/shared/ui';
import { formatDate } from '@/shared/lib/format';

import type { DateRange } from 'react-day-picker';

/** Calendar icon button that opens a two-month range picker. Range mode: the first
 *  click sets the start date, the second click sets the end date — clicking the same
 *  day twice selects that single day as both start and end. */
export function DateRangeFilter() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const label =
    range?.from && range.to
      ? range.from.getTime() === range.to.getTime()
        ? formatDate(range.from)
        : `${formatDate(range.from)} – ${formatDate(range.to)}`
      : range?.from
        ? formatDate(range.from)
        : 'Select date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          icon="calendar"
          aria-label="Select date range"
          title={label}
          style={{ width: 34, padding: 0, flex: 'none' }}
        />
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={6}>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          defaultMonth={range?.from}
        />
      </PopoverContent>
    </Popover>
  );
}
