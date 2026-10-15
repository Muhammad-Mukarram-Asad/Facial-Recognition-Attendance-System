"use client";

import { useMemo, useState, type ReactNode } from "react";

import { DateRangeFilter } from "@/features/dashboard/components/DateRangeFilter";
import { orDash } from "@/shared/lib/format";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { Avatar, Badge, Button, Card, EmptyState, Icon, SkeletonRows } from "@/shared/ui";
import type { Tone } from "@/shared/types";

import { useAttendanceRegister } from "../hooks/useAttendance";
import { startOfToday, toRegisterTimestamp, type AttendanceRecord } from "../types";

const GRID =
  "minmax(180px,1.5fr) 72px minmax(120px,1fr) minmax(120px,1fr) 88px 88px 64px 96px 72px 110px";

function statusTone(status: string): Tone {
  if (status === "present") return "success";
  if (status === "absent") return "high";
  if (status === "leave") return "medium";
  return "neutral";
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

const ATTENDANCE_TIME_ZONE = "Asia/Karachi";

/** Check-in and check-out are UTC instants. Show the Asia/Karachi clock. */
function formatRecordTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ATTENDANCE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const period = (parts.find((part) => part.type === "dayPeriod")?.value ?? "").toLowerCase();
  return `${hour.padStart(2, "0")}:${minute} ${period}`;
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function AttendanceView() {
  const isDesktop = useIsDesktop();
  const [date, setDate] = useState(startOfToday);
  const [search, setSearch] = useState("");
  const register = useAttendanceRegister(toRegisterTimestamp(date));

  const records = register.data?.records ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      [record.name, String(record.employee_id), record.designation, record.department, record.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [records, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card padding="16px 18px" style={{ gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <DateRangeFilter date={date} onChange={setDate} />
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
              placeholder="Search name, ID, designation, department, or status"
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
            {register.data ? `${filtered.length} of ${register.data.total}` : "—"}
          </span>
        </div>
      </Card>

      {register.isError ? (
        <Card padding="28px" style={{ alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-body)" }}>
            Could not load attendance records.
          </span>
          <Button size="sm" icon="refresh-cw" onClick={() => register.refetch()}>
            Retry
          </Button>
        </Card>
      ) : register.isPending || !register.data ? (
        <Card padding={18}>
          <SkeletonRows rows={8} height={44} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card padding={0}>
          <EmptyState
            message={records.length === 0 ? "No attendance rows for this day" : "No records match that search"}
            icon="search-x"
          />
        </Card>
      ) : isDesktop ? (
        <RecordTable records={filtered} />
      ) : (
        <RecordCards records={filtered} />
      )}
    </div>
  );
}

function RecordTable({ records }: { records: AttendanceRecord[] }) {
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
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
            minWidth: 1100,
          }}
        >
          <span>Employee</span>
          <span>ID</span>
          <span>Designation</span>
          <span>Department</span>
          <span>Check in</span>
          <span>Check out</span>
          <span>Hours</span>
          <span>Status</span>
          <span>Late</span>
          <span>Early departure</span>
        </div>
        {records.map((record) => (
          <div
            key={record.employee_id}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 12,
              alignItems: "center",
              padding: "12px 18px",
              borderBottom: "1px solid var(--border-subtle)",
              minWidth: 1100,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <Avatar name={record.name} size={32} />
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
                {record.name}
              </span>
            </span>
            <Cell mono>{record.employee_id}</Cell>
            <Cell>{orDash(record.designation)}</Cell>
            <Cell>{orDash(record.department)}</Cell>
            <Cell mono>{formatRecordTime(record.check_in)}</Cell>
            <Cell mono>{formatRecordTime(record.check_out)}</Cell>
            <Cell mono>{record.hours == null ? "—" : String(record.hours)}</Cell>
            <Badge tone={statusTone(record.status)} dot>
              {statusLabel(record.status)}
            </Badge>
            <Cell>{yesNo(record.is_late)}</Cell>
            <Cell>{yesNo(record.is_early_departure)}</Cell>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecordCards({ records }: { records: AttendanceRecord[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {records.map((record) => (
        <Card key={record.employee_id} padding="14px 16px" style={{ gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={record.name} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-strong)" }}>{record.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
                {record.employee_id}
              </div>
            </div>
            <Badge tone={statusTone(record.status)} dot>
              {statusLabel(record.status)}
            </Badge>
          </div>
          <Field label="Designation" value={orDash(record.designation)} />
          <Field label="Department" value={orDash(record.department)} />
          <Field label="Check in" value={formatRecordTime(record.check_in)} />
          <Field label="Check out" value={formatRecordTime(record.check_out)} />
          <Field label="Hours" value={record.hours == null ? "—" : String(record.hours)} />
          <Field label="Late" value={yesNo(record.is_late)} />
          <Field label="Early departure" value={yesNo(record.is_early_departure)} />
        </Card>
      ))}
    </div>
  );
}

function Cell({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <span
      style={{
        fontFamily: mono ? "var(--font-mono)" : undefined,
        fontSize: 13,
        color: "var(--text-body)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span style={{ color: "var(--text-body)", textAlign: "right" }}>{value}</span>
    </div>
  );
}
