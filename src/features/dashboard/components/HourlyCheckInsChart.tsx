'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardHeader } from '@/shared/ui';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui';

import { RANGE_SCALE, type DashboardRange } from '../types';

import type { ChartConfig } from '@/shared/ui';

// Same shape as shadcn/ui's chart demo dataset.
const BASE_DATA = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig;

/** Stacked area chart — shadcn/ui "Area Chart" pattern with its stock dummy data,
 *  scaled by the selected date range so the range tabs stay interactive. */
export function HourlyCheckInsChart({ range }: { range: DashboardRange }) {
  const scale = RANGE_SCALE[range] ?? 1;
  const chartData = BASE_DATA.map((point) => ({
    month: point.month,
    desktop: Math.round(point.desktop * scale),
    mobile: Math.round(point.mobile * scale),
  }));
  return (
    <Card style={{ flex: '1 1 420px', gap: 16 }}>
      <CardHeader
        title="Check-ins by hour"
        meta={
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
            January — June
          </span>
        }
      />
      <ChartContainer config={chartConfig} style={{ aspectRatio: 'auto', height: 180, width: '100%' }}>
        <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) => value.slice(0, 3)}
            tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <defs>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <Area
            dataKey="mobile"
            type="natural"
            fill="url(#fillMobile)"
            stroke="var(--color-mobile)"
            strokeWidth={2}
            stackId="a"
          />
          <Area
            dataKey="desktop"
            type="natural"
            fill="url(#fillDesktop)"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}
