'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardHeader } from '@/shared/ui';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/shared/ui';

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

/** Grouped bar chart — shadcn/ui "Bar Chart - Multiple" pattern with its stock dummy data,
 *  scaled by the selected date range so the range tabs stay interactive. */
export function PunctualityChart({ range }: { range: DashboardRange }) {
  const scale = RANGE_SCALE[range] ?? 1;
  const chartData = BASE_DATA.map((point) => ({
    month: point.month,
    desktop: Math.round(point.desktop * scale),
    mobile: Math.round(point.mobile * scale),
  }));

  return (
    <Card style={{ flex: '1 1 300px', gap: 16 }}>
      <CardHeader
        title="Punctuality this week"
        meta={<span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--success)' }}>+3.1%</span>}
      />

      <ChartContainer config={chartConfig} style={{ aspectRatio: 'auto', height: 170, width: '100%' }}>
        <BarChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) => value.slice(0, 3)}
            tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
