import { Card, Counter } from "@/shared/ui";
import { formatDate } from "@/shared/lib/format";

import type { AttendanceAnalytics } from "../types";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const LEGEND_DELAY_MS = 300;

function formatPeriodDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return formatDate(new Date(year, month - 1, day));
}

function periodLabel(analytics: AttendanceAnalytics): string {
  const from = formatPeriodDate(analytics.period_from);
  const to = formatPeriodDate(analytics.period_to);
  return from === to ? from : `${from} – ${to}`;
}

export function PresenceCard({ analytics }: { analytics: AttendanceAnalytics }) {
  const offset = CIRCUMFERENCE * (1 - Math.min(analytics.present_percent, 100) / 100);

  return (
    <Card padding="20px 22px" style={{ flexDirection: "row", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: 132, height: 132, flex: "none" }}>
        <svg viewBox="0 0 120 120" style={{ width: 132, height: 132, transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--surface-sunken)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="url(#presenceRing)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE.toFixed(1)}
            strokeDashoffset={offset.toFixed(1)}
            style={{ transition: "stroke-dashoffset 700ms var(--ease-out)" }}
          />
          <defs>
            <linearGradient id="presenceRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1FB4A2" />
              <stop offset="100%" stopColor="#2E52E0" />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-strong)" }}>
            <Counter value={analytics.present_percent} decimals={2} />%
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            Present
          </span>
        </div>
      </div>

      <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
          Presence · {periodLabel(analytics)}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
          {[
            { color: "var(--priority-high)", suffix: "absent", value: analytics.absent_percent },
            { color: "var(--warning)", suffix: "late", value: analytics.late_percent },
          ].map((item) => (
            <span
              key={item.suffix}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-body)" }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
              <Counter value={item.value} decimals={2} delayMs={LEGEND_DELAY_MS} />% {item.suffix}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
