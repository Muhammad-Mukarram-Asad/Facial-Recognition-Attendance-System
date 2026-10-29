"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { DateRangeFilter } from "@/features/dashboard/components/DateRangeFilter";
import {
  EmployeePhotoModal,
  type EmployeePhotoPreview,
} from "@/features/dashboard/components/EmployeePhotoModal";
import { streamPhotoUrl } from "@/features/dashboard/api/attendance-stream.api";
import { useAllEmployees } from "@/features/employees/hooks/useEmployees";
import { formatDate, orDash } from "@/shared/lib/format";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { Avatar, Badge, Button, Card, EmptyState, Icon, SegmentedControl, SkeletonRows } from "@/shared/ui";
import type { Tone } from "@/shared/types";

import type { AttendanceRegisterQuery } from "../api/attendance.api";
import { useAttendanceRegister } from "../hooks/useAttendance";
import {
  AttendanceStatus,
  startOfToday,
  toRegisterTimestamp,
  type AttendanceRecord,
  type AttendanceRegister,
} from "../types";

const PAGE_SIZE = 100;
const PAGE_WINDOW = 5;

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  early: "Early",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...AttendanceStatus.options.map((value) => ({ value, label: STATUS_LABELS[value] })),
];

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

/** Present and absent go out as `status`. Late and early also set the boolean flags. */
function filterToQuery(timestamp: string, filter: StatusFilter): AttendanceRegisterQuery {
  if (filter === "late") return { timestamp, status: "late", is_late: true };
  if (filter === "early") return { timestamp, status: "early", is_early_departure: true };
  if (filter === "present" || filter === "absent") return { timestamp, status: filter };
  return { timestamp };
}

const GRID =
  "minmax(180px,1.5fr) 72px minmax(120px,1fr) minmax(120px,1fr) 88px 88px 64px 96px 72px 110px";

function statusTone(status: string): Tone {
  if (status === "present") return "success";
  if (status === "absent") return "high";
  if (status === "late" || status === "early") return "warning";
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
  const [page, setPage] = useState(1);
  const [windowStart, setWindowStart] = useState(1);
  const [preview, setPreview] = useState<EmployeePhotoPreview | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);
  const roster = useAllEmployees();
  const timestamp = toRegisterTimestamp(date);
  const register = useAttendanceRegister(filterToQuery(timestamp, statusFilter));

  // Date, status, and search each restart the list at page 1.
  const listKey = `${timestamp}|${statusFilter}|${search}`;
  const [settledListKey, setSettledListKey] = useState(listKey);
  const listChanged = listKey !== settledListKey;
  if (listChanged) {
    setSettledListKey(listKey);
    setPage(1);
    setWindowStart(1);
  }

  const snapshot = useMemo(
    () => (register.data ? copyRegister(register.data) : null),
    [register.data],
  );
  const records = snapshot?.records ?? [];
  const enrollmentPhotos = useMemo(() => {
    const photos = new Map<number, string>();
    for (const employee of roster.data?.items ?? []) {
      const id = Number(employee.id);
      if (Number.isFinite(id) && employee.photoPath) photos.set(id, employee.photoPath);
    }
    return photos;
  }, [roster.data]);
  const imageFor = useCallback(
    (record: AttendanceRecord) => record.image_path ?? enrollmentPhotos.get(record.employee_id) ?? null,
    [enrollmentPhotos],
  );
  const openPhoto = useCallback(
    (record: AttendanceRecord) => {
      const imagePath = record.image_path ?? enrollmentPhotos.get(record.employee_id) ?? null;
      if (!imagePath) return;
      const checkIn = formatRecordTime(record.check_in);
      const dayLabel = formatDate(date);
      const flagged = record.status === "absent" || record.is_late || record.is_early_departure;
      setPreview({
        name: record.name,
        imagePath,
        headline: statusLabel(record.status),
        context: record.department?.trim() || "",
        whenLabel: checkIn === "—" ? dayLabel : `${dayLabel} · ${checkIn}`,
        tone: flagged ? "warning" : "success",
      });
    },
    [date, enrollmentPhotos],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      if (!query) return true;
      return [record.name, String(record.employee_id), record.designation, record.department, record.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [records, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(listChanged ? 1 : page, pageCount);
  const currentWindowStart = listChanged || windowStart > pageCount ? 1 : windowStart;
  if (!listChanged && (currentPage !== page || currentWindowStart !== windowStart)) {
    setPage(currentPage);
    setWindowStart(currentWindowStart);
  }
  const pageRecords = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = pageRecords.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = pageRecords.length > 0 ? rangeStart + pageRecords.length - 1 : 0;

  const selectPage = (next: number) => {
    const clicked = Math.min(Math.max(1, next), pageCount);
    const windowEnd = Math.min(pageCount, currentWindowStart + PAGE_WINDOW - 1);
    let start = currentWindowStart;
    // The last visible number becomes the start of the next window: 1–5, then 5–9, then 9–13.
    if (clicked === windowEnd && clicked < pageCount) start = clicked;
    else if (clicked < currentWindowStart) start = Math.max(1, clicked - PAGE_WINDOW + 1);
    else if (clicked > windowEnd) start = clicked;
    setWindowStart(start);
    setPage(clicked);
  };

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
      ) : register.isPending || !register.data || register.isPlaceholderData ? (
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
      ) : (
        <>
          {isDesktop ? (
            <RecordTable records={pageRecords} imageFor={imageFor} onOpen={openPhoto} />
          ) : (
            <RecordCards records={pageRecords} imageFor={imageFor} onOpen={openPhoto} />
          )}
          <RecordPagination
            page={currentPage}
            pageCount={pageCount}
            windowStart={currentWindowStart}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={filtered.length}
            onSelect={selectPage}
          />
        </>
      )}
      {preview ? <EmployeePhotoModal preview={preview} onClose={closePreview} /> : null}
    </div>
  );
}

function RecordPagination({
  page,
  pageCount,
  windowStart,
  rangeStart,
  rangeEnd,
  total,
  onSelect,
}: {
  page: number;
  pageCount: number;
  windowStart: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onSelect: (page: number) => void;
}) {
  const windowEnd = Math.min(pageCount, windowStart + PAGE_WINDOW - 1);
  const pages: number[] = [];
  for (let number = windowStart; number <= windowEnd; number += 1) pages.push(number);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
        Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of {total.toLocaleString()}
      </span>
      <nav aria-label="Attendance record pages" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Button variant="ghost" size="sm" icon="chevron-left" disabled={page <= 1} onClick={() => onSelect(page - 1)}>
          Prev
        </Button>
        {pages.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onSelect(number)}
            aria-current={number === page ? "page" : undefined}
            style={{
              padding: "5px 12px",
              border: "none",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: number === page ? 700 : 500,
              background: number === page ? "var(--interactive-primary)" : "transparent",
              color: number === page ? "#fff" : "var(--text-muted)",
            }}
          >
            {number}
          </button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          icon="chevron-right"
          iconPosition="end"
          disabled={page >= pageCount}
          onClick={() => onSelect(page + 1)}
        >
          Next
        </Button>
      </nav>
    </div>
  );
}

function RecordTable({
  records,
  imageFor,
  onOpen,
}: {
  records: AttendanceRecord[];
  imageFor: (record: AttendanceRecord) => string | null;
  onOpen: (record: AttendanceRecord) => void;
}) {
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
              <RecordPhoto
                name={record.name}
                imagePath={imageFor(record)}
                size={40}
                onOpen={() => onOpen(record)}
              />
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

function RecordCards({
  records,
  imageFor,
  onOpen,
}: {
  records: AttendanceRecord[];
  imageFor: (record: AttendanceRecord) => string | null;
  onOpen: (record: AttendanceRecord) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {records.map((record, index) => (
        <Card key={`${record.employee_id}-${index}`} padding="14px 16px" style={{ gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RecordPhoto
              name={record.name}
              imagePath={imageFor(record)}
              size={44}
              onOpen={() => onOpen(record)}
            />
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

function RecordPhoto({
  name,
  imagePath,
  size,
  onOpen,
}: {
  name: string;
  imagePath: string | null;
  size: number;
  onOpen: () => void;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const src = streamPhotoUrl(imagePath);
  const failed = imagePath != null && failedPath === imagePath;

  if (!src || failed) return <Avatar name={name} size={size} />;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View photo of ${name}`}
      style={{
        padding: 0,
        border: 0,
        background: "transparent",
        borderRadius: 11,
        cursor: "zoom-in",
        display: "block",
        lineHeight: 0,
        flex: "none",
      }}
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setFailedPath(imagePath)}
        style={{ width: size, height: size, borderRadius: 11, objectFit: "cover", display: "block" }}
      />
    </button>
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
