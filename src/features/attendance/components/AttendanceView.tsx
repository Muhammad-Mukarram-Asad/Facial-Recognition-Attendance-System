"use client";

import { useMemo, useState } from "react";

import { useAttendanceStreamStatus } from "@/features/dashboard/hooks/useAttendanceStream";
import { useLiveAttendanceEvents } from "@/features/dashboard/hooks/useLiveAttendanceEvents";
import { formatClock, formatDate } from "@/shared/lib/format";
import { Avatar, Card, EmptyState, Icon, SkeletonRows } from "@/shared/ui";

const GRID = "minmax(200px, 1.6fr) 110px 110px minmax(140px, 1fr) 160px";

export function AttendanceView() {
  const { events } = useLiveAttendanceEvents();
  const { isConnected } = useAttendanceStreamStatus();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;
    return events.filter((event) =>
      [event.employee_name, String(event.employee_id), event.location, event.event_type]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [events, search]);

  const isPending = !isConnected && events.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card padding="16px 18px" style={{ gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label
            style={{
              flex: "1 1 240px",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
            }}
          >
            <Icon name="search" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, location, or event"
              aria-label="Search attendance records"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                color: "var(--text-strong)",
              }}
            />
          </label>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-faint)" }}>
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>
      </Card>

      <Card padding={0} style={{ overflow: "hidden" }}>
        {isPending ? (
          <div style={{ padding: 18 }}>
            <SkeletonRows rows={8} height={44} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={events.length === 0 ? "No gate activity in the last 24 hours" : "No records match that search"}
            icon="scan-face"
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: 12,
                padding: "12px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                minWidth: 720,
              }}
            >
              <span>Employee</span>
              <span>ID</span>
              <span>Event</span>
              <span>Location</span>
              <span>Time</span>
            </div>
            {filtered.map((event) => {
              const when = new Date(event.timestamp);
              const name = event.employee_name || `Employee #${event.employee_id}`;
              return (
                <div
                  key={event.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID,
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 18px",
                    borderBottom: "1px solid var(--border-subtle)",
                    minWidth: 720,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar name={name} size={32} />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-strong)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </span>
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-body)" }}>
                    {event.employee_id}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: event.event_type === "exit" ? "var(--warning)" : "var(--success)",
                      textTransform: "uppercase",
                    }}
                  >
                    {event.event_type}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-body)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {event.location}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-body)" }}>
                    {Number.isNaN(when.getTime()) ? event.timestamp : `${formatDate(when)} ${formatClock(when)}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
