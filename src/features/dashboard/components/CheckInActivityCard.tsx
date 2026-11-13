'use client';

import { useMemo } from 'react';

import { Card, CardHeader, EmptyState, Skeleton } from '@/shared/ui';

import { useLiveAttendanceEvents } from '../hooks/useLiveAttendanceEvents';
import { isStrangerEvent, type AttendanceStreamEvent } from '../types';

const HOURS = 24;

/**
 * Check-ins by hour of day, from the same last-24h feed as the live grid.
 * Exits and unknown people are left out, so the tallest bar is when
 * employees actually arrive.
 */
export function CheckInActivityCard() {
  const { events, isPending } = useLiveAttendanceEvents();
  const counts = useMemo(() => checkInsByHour(events), [events]);
  const peak = Math.max(...counts);
  const peakHours = counts.flatMap((count, hour) => (count === peak && peak > 0 ? [hour] : []));
  const total = counts.reduce((sum, count) => sum + count, 0);

  return (
    <Card style={{ gap: 14 }}>
      <CardHeader
        title="Check-in times"
        meta={
          <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Last 24 hours</span>
        }
      />

      {isPending ? (
        <Skeleton height={210} radius={14} />
      ) : total === 0 ? (
        <EmptyState message="No check-ins in the last 24 hours" icon="clock" />
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-strong)' }}>
            Most check-ins at {peakHours.map(hourClock).join(' and ')}
            <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
              {' '}
              · {peak} {peak === 1 ? 'arrival' : 'arrivals'}
            </span>
          </p>
          <HourBars counts={counts} peak={peak} />
        </>
      )}
    </Card>
  );
}

function HourBars({ counts, peak }: { counts: number[]; peak: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          height: 148,
        }}
      >
        {counts.map((count, hour) => {
          const isPeak = count === peak && count > 0;
          return (
            <div
              key={hour}
              title={`${hourClock(hour)} · ${count} ${count === 1 ? 'check-in' : 'check-ins'}`}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '100%',
                  height: count === 0 ? 3 : `${(count / peak) * 100}%`,
                  minHeight: count === 0 ? 3 : 6,
                  borderRadius: '6px 6px 3px 3px',
                  background: isPeak
                    ? 'linear-gradient(180deg, #2e52e0 0%, #1fb4a2 100%)'
                    : count > 0
                      ? 'var(--brand-indigo-100)'
                      : 'var(--surface-sunken)',
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {counts.map((_, hour) => (
          <span
            key={hour}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              textAlign: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-faint)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {hour % 3 === 0 ? hourTick(hour) : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function checkInsByHour(events: AttendanceStreamEvent[]): number[] {
  const counts = Array.from({ length: HOURS }, () => 0);
  for (const event of events) {
    if (!isEmployeeCheckIn(event)) continue;
    const time = Date.parse(event.timestamp);
    if (Number.isNaN(time)) continue;
    counts[new Date(time).getHours()] += 1;
  }
  return counts;
}

function isEmployeeCheckIn(event: AttendanceStreamEvent): boolean {
  if (isStrangerEvent(event)) return false;
  return event.event_type.trim().toLowerCase() !== 'exit';
}

/** "9:00 am" — the sentence under the chart title. */
function hourClock(hour: number): string {
  const onClock = hour % 12 || 12;
  return `${onClock}:00 ${hour < 12 ? 'am' : 'pm'}`;
}

/** Short axis tick: "9a", "12p". */
function hourTick(hour: number): string {
  const onClock = hour % 12 || 12;
  return `${onClock}${hour < 12 ? 'a' : 'p'}`;
}
