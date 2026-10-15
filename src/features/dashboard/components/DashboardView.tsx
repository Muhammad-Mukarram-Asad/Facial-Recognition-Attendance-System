"use client";

import { useState } from "react";

import { PageToolbar, ToolbarSpacer } from "@/features/shell/components/PageToolbar";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { Button, Card, Counter, Skeleton, StatCard } from "@/shared/ui";

import { useAttendanceAnalytics } from "../hooks/useDashboard";
import { startOfToday, toPeriodBounds } from "../types";
import { DateRangeFilter } from "./DateRangeFilter";
import { LiveStreamCard } from "./LiveStreamCard";
import { PresenceCard } from "./PresenceCard";

const CARD_DELAY_MS = 550;

export function DashboardView() {
  const isDesktop = useIsDesktop();
  const [date, setDate] = useState(startOfToday);
  const period = toPeriodBounds(date);
  const analytics = useAttendanceAnalytics(period.start_at, period.end_at);

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
      ) : analytics.isPending || !analytics.data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton height={172} radius={14} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <Skeleton height={110} radius={14} />
            <Skeleton height={110} radius={14} />
            <Skeleton height={110} radius={14} />
          </div>
        </div>
      ) : (
        <>
          <PresenceCard analytics={analytics.data} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(3, minmax(0, 1fr))" : "1fr",
              gap: 12,
            }}
          >
            <StatCard
              label="Total employees"
              padding="16px 18px"
              value={<Counter value={analytics.data.total_employees} delayMs={CARD_DELAY_MS} />}
            />
            <StatCard
              label="Enrolled faces"
              padding="16px 18px"
              value={<Counter value={analytics.data.enrolled_faces} delayMs={CARD_DELAY_MS + 80} />}
            />
            <StatCard
              label="Blacklisted attempts"
              padding="16px 18px"
              valueTone="high"
              value={<Counter value={analytics.data.blacklisted_attempts} delayMs={CARD_DELAY_MS + 160} />}
            />
          </div>
        </>
      )}

      <LiveStreamCard />
    </div>
  );
}
