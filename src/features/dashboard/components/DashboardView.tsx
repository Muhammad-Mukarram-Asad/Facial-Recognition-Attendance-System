"use client";

import { useState, type ReactNode } from "react";

import { PageToolbar, ToolbarSpacer } from "@/features/shell/components/PageToolbar";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { Button, Card, Counter, Skeleton, StatCard } from "@/shared/ui";

import { useAttendanceAnalytics } from "../hooks/useDashboard";
import { startOfToday, toDayTimestamp } from "../types";
import { DateRangeFilter } from "./DateRangeFilter";
import { LiveStreamCard } from "./LiveStreamCard";
import { PresenceCard } from "./PresenceCard";

const CARD_DELAY_MS = 550;

function percentSub(value: number, delayMs: number) {
  return {
    label: "Share",
    value: (
      <>
        <Counter value={value} decimals={2} delayMs={delayMs} />%
      </>
    ),
  };
}

export function DashboardView() {
  const isDesktop = useIsDesktop();
  const [date, setDate] = useState(startOfToday);
  const analytics = useAttendanceAnalytics(toDayTimestamp(date));
  const data = analytics.data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageToolbar>
        <DateRangeFilter date={date} onChange={setDate} />
        <ToolbarSpacer />
      </PageToolbar>

      {analytics.isError ? (
        <Card padding="28px" style={{ alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-body)" }}>
            Could not load attendance analytics.
          </span>
          <Button size="sm" icon="refresh-cw" onClick={() => analytics.refetch()}>
            Retry
          </Button>
        </Card>
      ) : analytics.isPending || !data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton height={172} radius={14} />
          <StatGrid isDesktop={isDesktop}>
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} height={110} radius={14} />
            ))}
          </StatGrid>
        </div>
      ) : (
        <>
          <PresenceCard analytics={data} />
          <StatGrid isDesktop={isDesktop}>
            <CountCard label="Present" value={data.present} percent={data.present_percent} delayMs={CARD_DELAY_MS} />
            <CountCard
              label="Absent"
              value={data.absent}
              percent={data.absent_percent}
              delayMs={CARD_DELAY_MS + 60}
              valueTone="high"
            />
            <CountCard
              label="Late"
              value={data.late}
              percent={data.late_percent}
              delayMs={CARD_DELAY_MS + 120}
              valueTone="warning"
            />
            <CountCard label="On leave" value={data.leave} delayMs={CARD_DELAY_MS + 180} />
            <CountCard
              label="Blacklisted"
              value={data.blacklisted}
              percent={data.blacklisted_percent}
              delayMs={CARD_DELAY_MS + 240}
              valueTone="high"
            />
            <CountCard label="Total" value={data.total} delayMs={CARD_DELAY_MS + 300} />
            <CountCard label="Total employees" value={data.total_employees} delayMs={CARD_DELAY_MS + 360} />
            <CountCard label="Enrolled faces" value={data.enrolled_faces} delayMs={CARD_DELAY_MS + 420} />
          </StatGrid>
        </>
      )}

      <LiveStreamCard />
    </div>
  );
}

function StatGrid({ isDesktop, children }: { isDesktop: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isDesktop ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function CountCard({
  label,
  value,
  percent,
  delayMs,
  valueTone,
}: {
  label: string;
  value: number;
  percent?: number;
  delayMs: number;
  valueTone?: "high" | "warning";
}) {
  return (
    <StatCard
      label={label}
      padding="16px 18px"
      valueTone={valueTone}
      value={<Counter value={value} delayMs={delayMs} />}
      subs={percent == null ? undefined : [percentSub(percent, delayMs + 40)]}
    />
  );
}
