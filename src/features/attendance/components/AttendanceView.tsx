"use client";

import { useMemo, useState, type ReactNode } from "react";

import { DateRangeFilter } from "@/features/dashboard/components/DateRangeFilter";
import { orDash } from "@/shared/lib/format";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { Avatar, Badge, Button, Card, EmptyState, Icon, SegmentedControl, SkeletonRows } from "@/shared/ui";
import type { Tone } from "@/shared/types";

import { useAttendanceRegister } from "../hooks/useAttendance";
import { startOfToday, toRegisterTimestamp, type AttendanceRecord, type AttendanceRegister } from "../types";

/** Unknown people arrive with employee id 0, same as the live gate stream. */
const STRANGER_EMPLOYEE_ID = 0;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "strangers", label: "Strangers" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

function matchesStatus(record: AttendanceRecord, filter: StatusFilter): boolean {
  const status = record.status.trim().toLowerCase();
  switch (filter) {
    case "all":
      return true;
    case "present":
      return status === "present";
    case "absent":
      return status === "absent";
    case "late":
      return record.is_late || status === "late";
    case "strangers":
      return record.employee_id === STRANGER_EMPLOYEE_ID || status === "stranger" || status === "strangers";
  }
}

const GRID =
  "minmax(180px,1.5fr) 72px minmax(120px,1fr) minmax(120px,1fr) 88px 88px 64px 96px 72px 110px";

function statusTone(status: string): Tone {
  if (status === "present") return "success";
  if (status === "absent") return "high";
  if (status === "late") return "warning";
  if (status === "stranger" || status === "strangers") return "medium";
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

function copyRegister(data: AttendanceRegister): AttendanceRegister {
  return {
    ...data,
    records: data.records.map((record) => ({ ...record })),
  };
}

export function AttendanceView() {
  const isDesktop = useIsDesktop();
  const [date, setDate] = useState(startOfToday);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const register = useAttendanceRegister(toRegisterTimestamp(date));

  // The register request returns the whole day. Status filters run on a
  // local copy so changing the chip does not refetch.
  const snapshot = useMemo(
    () => (register.data ? copyRegister(register.data) : null),
    [register.data],
  );
  const records = snapshot?.records ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      if (!matchesStatus(record, statusFilter)) return false;
      if (!query) return true;
      return [record.name, String(record.employee_id), record.designation, record.department, record.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [records, search, statusFilter]);

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
            {snapshot ? `${filtered.length} of ${snapshot.total}` : "—"}
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <SegmentedControl
            size="sm"
            ariaLabel="Filter attendance by status"
            options={[...STATUS_FILTERS]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
          />
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
            message={
              records.length === 0
                ? "No attendance rows for this day"
                : search.trim()
                  ? "No records match that search"
                  : "No records match that status"
            }
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
        {records.map((record, index) => (
          <div
            key={`${record.employee_id}-${index}`}
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
      {records.map((record, index) => (
        <Card key={`${record.employee_id}-${index}`} padding="14px 16px" style={{ gap: 10 }}>
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
