'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import styles from './Calendar.module.css';

import type { DayPickerProps } from 'react-day-picker';

export type CalendarProps = DayPickerProps;

/** Two-month range calendar. In range mode, clicking a day sets the start; a second
 *  click sets the end — clicking the same day twice selects that single day. */
export function Calendar(props: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={styles.root}
      classNames={{
        months: styles.months,
        month: styles.month,
        month_caption: styles.monthCaption,
        nav: styles.nav,
        button_previous: styles.navButton,
        button_next: styles.navButton,
        month_grid: styles.monthGrid,
        weekdays: styles.weekdays,
        weekday: styles.weekday,
        week: styles.week,
        day: styles.day,
        day_button: styles.dayButton,
        today: styles.today,
        outside: styles.outside,
        disabled: styles.disabled,
        selected: styles.selected,
        range_start: styles.range_start,
        range_end: styles.range_end,
        range_middle: styles.range_middle,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />,
      }}
      {...props}
    />
  );
}
