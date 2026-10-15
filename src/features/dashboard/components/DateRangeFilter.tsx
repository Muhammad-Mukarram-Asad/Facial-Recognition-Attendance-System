"use client";

import { useState } from "react";

import { formatDate } from "@/shared/lib/format";
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";

import { isSameLocalDay } from "../types";

/** Day picker for the dashboard. Future days are disabled; today starts selected. */
export function DateRangeFilter({
  date,
  onChange,
}: {
  date: Date;
  onChange: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = formatDate(date);
  const todaySelected = isSameLocalDay(date, new Date());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          icon="calendar"
          aria-label={`Attendance period ${label}`}
          title={label}
          style={
            todaySelected
              ? { borderColor: "var(--interactive-primary)", boxShadow: "0 0 0 1px var(--interactive-primary)" }
              : undefined
          }
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6}>
        <Calendar
          mode="single"
          numberOfMonths={2}
          selected={date}
          disabled={{ after: new Date() }}
          onSelect={(next) => {
            if (!next) return;
            onChange(next);
            setOpen(false);
          }}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
