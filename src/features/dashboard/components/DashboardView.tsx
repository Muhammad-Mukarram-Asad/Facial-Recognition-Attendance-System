"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PageToolbar,
  ToolbarSpacer,
} from "@/features/shell/components/PageToolbar";
import { ROUTES } from "@/shared/config/routes";
import {
  Button,
  Card,
  Counter,
  SegmentedControl,
  Skeleton,
  StatCard,
} from "@/shared/ui";

import { useDashboardOverview } from "../hooks/useDashboard";
import { RANGE_OPTIONS, type DashboardRange } from "../types";
import { DateRangeFilter } from "./DateRangeFilter";
import { HourlyCheckInsChart } from "./HourlyCheckInsChart";
import { LiveStreamCard } from "./LiveStreamCard";
// HIDDEN — leave management.
// import { PendingLeaveCard } from './PendingLeaveCard';
import { PresenceCard } from "./PresenceCard";
import { PunctualityChart } from "./PunctualityChart";
// HIDDEN — attendance risk list.
// import { RiskListCard } from './RiskListCard';

// Staggered so the workforce row visibly follows the presence card's own animation.
const WORKFORCE_DELAY_MS = 550;
const DEVICE_DELAY_MS = 750;
const SECURITY_DELAY_MS = 910;

export function DashboardView() {
  const router = useRouter();
  const [range, setRange] = useState<DashboardRange>("24h");
  const { data, isPending, isError, refetch } = useDashboardOverview(range);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageToolbar>
        <div style={{ maxWidth: "100%", overflowX: "auto" }}>
          <SegmentedControl
            size="sm"
            ariaLabel="Date range"
            options={[...RANGE_OPTIONS]}
            value={range}
            onChange={(value) => setRange(value as DashboardRange)}
          />
        </div>
        <DateRangeFilter />
        <ToolbarSpacer />
        {/* HIDDEN — filters panel not built yet.
        <Button variant="secondary" size="sm" icon="sliders-horizontal">
          Filters
        </Button>
        */}
        {/* <Button
          size="sm"
          icon="download"
          onClick={() => router.push(ROUTES.reports)}
        >
          Export
        </Button> */}
      </PageToolbar>

      {isError ? (
        <Card padding="28px" style={{ alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: "var(--text-body)",
            }}
          >
            Could not load the dashboard.
          </span>
          <Button size="sm" icon="refresh-cw" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : isPending || !data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton height={172} radius={14} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0,1fr))",
              gap: 12,
            }}
          >
            <Skeleton height={110} radius={14} />
            <Skeleton height={110} radius={14} />
            <Skeleton height={110} radius={14} />
            <Skeleton height={110} radius={14} />
            <Skeleton height={110} radius={14} />
          </div>
          <Skeleton height={320} radius={14} />
        </div>
      ) : (
        <>
          <PresenceCard presence={data.presence} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0,1fr))",
              gap: 12,
            }}
          >
            <StatCard
              label="Total employees"
              padding="16px 18px"
              value={
                <Counter
                  value={data.workforce.total}
                  delayMs={WORKFORCE_DELAY_MS}
                />
              }
              subs={[
                {
                  label: "Active",
                  value: (
                    <Counter
                      value={data.workforce.active}
                      delayMs={WORKFORCE_DELAY_MS + 80}
                    />
                  ),
                },
                {
                  label: "Absent",
                  value: (
                    <Counter
                      value={data.absence.total}
                      delayMs={WORKFORCE_DELAY_MS + 160}
                    />
                  ),
                  tone: "high",
                },
              ]}
            />
            <StatCard
              label="Enrolled faces"
              padding="16px 18px"
              value={
                <Counter
                  value={data.device.enrolledFaces}
                  delayMs={DEVICE_DELAY_MS}
                />
              }
              subs={[
                {
                  label: "Coverage",
                  value: `${Math.round((data.device.enrolledFaces / data.workforce.total) * 100)}%`,
                },
              ]}
            />
            <StatCard
              label="Gate cameras"
              padding="16px 18px"
              value={
                <Counter
                  value={data.device.gateCameras}
                  delayMs={DEVICE_DELAY_MS + 80}
                />
              }
              subs={[
                {
                  label: "Match accuracy",
                  value: `${data.device.matchAccuracy}%`,
                  tone: "success",
                },
              ]}
            />
            <StatCard
              label="Strangers detected"
              padding="16px 18px"
              valueTone="warning"
              value={
                <Counter
                  value={data.security.strangers}
                  delayMs={SECURITY_DELAY_MS}
                />
              }
              subs={data.security.strangersByCamera.map((entry, index) => ({
                label: `${entry.camera}:`,
                value: (
                  <Counter
                    value={entry.count}
                    delayMs={SECURITY_DELAY_MS + 80 + index * 60}
                  />
                ),
                tone: "warning" as const,
              }))}
            />
            <StatCard
              label="Blacklisted attempts"
              padding="16px 18px"
              valueTone="high"
              value={
                <Counter
                  value={data.security.blacklisted}
                  delayMs={SECURITY_DELAY_MS + 80}
                />
              }
              subs={data.security.blacklistedByCamera.map((entry, index) => ({
                label: `${entry.camera}:`,
                value: (
                  <Counter
                    value={entry.count}
                    delayMs={SECURITY_DELAY_MS + 160 + index * 60}
                  />
                ),
                tone: "high" as const,
              }))}
            />
            {/* HIDDEN — leave management.
            <PendingLeaveCard pendingLeave={data.pendingLeave} />
            */}
          </div>

          {/* Stream Attendance Card comes up before the charts */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            {/* HIDDEN — attendance risk list.
            <RiskListCard />
            */}
            <LiveStreamCard />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "stretch",
            }}
          >
            <HourlyCheckInsChart range={range} />
            <PunctualityChart range={range} />
          </div>
        </>
      )}
    </div>
  );
}
