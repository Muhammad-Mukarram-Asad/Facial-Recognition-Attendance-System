"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { useCan } from "@/features/auth/hooks/usePermission";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useDesignations } from "@/features/designations/hooks/useDesignations";
import { employeePhotoUrl } from "@/features/employees/api/employees.api";
import { useAllEmployees } from "@/features/employees/hooks/useEmployees";
import type { Employee, EmployeeStatusSlug } from "@/features/employees/types";
import { PERMISSIONS } from "@/shared/config/permissions";
import { ROUTES } from "@/shared/config/routes";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import { orDash } from "@/shared/lib/format";
import type { Tone } from "@/shared/types";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  FilterSelect,
  Icon,
  ListToolbar,
  SegmentedControl,
  SkeletonRows,
} from "@/shared/ui";

import {
  DIRECTORY_SORT_OPTIONS,
  DIRECTORY_STATUS_TABS,
  EMPTY_DIRECTORY_FACETS,
  catalogOptions,
  matchesDirectoryFilters,
  sortEmployees,
  statusOf,
  type DirectoryFacets,
  type DirectorySort,
  type DirectoryStatus,
} from "../lib/directoryView";
import { RowNavIndicator } from "./RowNavIndicator";

const PAGE_SIZE = 50;
const MAX_PAGE_BUTTONS = 5;

const GRID =
  "minmax(200px,1.6fr) 96px 96px 140px minmax(130px,1fr) minmax(130px,1fr) 116px 104px 18px";
const TABLE_MIN_WIDTH = 1120;

const STATUS_LABELS: Record<EmployeeStatusSlug, string> = {
  active: "Active",
  inactive: "Inactive",
  blacklisted: "Blacklisted",
  vip: "VIP",
};

const STATUS_TONES: Record<EmployeeStatusSlug, Tone> = {
  active: "success",
  inactive: "neutral",
  blacklisted: "high",
  vip: "brand",
};

/** Department and designation names, from the catalogs when the record only has ids. */
interface DirectoryRow {
  employee: Employee;
  department: string;
  designation: string;
}

function shiftLabel(employee: Employee): string {
  return employee.shiftStart && employee.shiftEnd ? `${employee.shiftStart}–${employee.shiftEnd}` : "—";
}

function rowMatches(row: DirectoryRow, query: string): boolean {
  const { employee } = row;
  return [
    employee.name,
    employee.id,
    employee.employeeCode,
    employee.attendanceCode,
    employee.phone,
    employee.cnic,
    row.designation,
    row.department,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/** A sliding window of up to 5 page numbers centered on the current page — e.g. page 7 of 20 -> 5…9. */
function getPageWindow(current: number, total: number, size = MAX_PAGE_BUTTONS): number[] {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Landing view for /employee-profile — the sidebar's "Employees" destination.
 * Same layout as the attendance register: search, status tabs, department /
 * designation filters and sorting, then a table (cards on mobile). The API
 * returns the whole roster; everything here runs on that list in the browser.
 */
export function ProfileDirectory() {
  const isDesktop = useIsDesktop();
  const canUpdate = useCan(PERMISSIONS.employeeUpdate);
  const canDelete = useCan(PERMISSIONS.employeeDelete);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DirectoryStatus>("all");
  const [facets, setFacets] = useState<DirectoryFacets>(EMPTY_DIRECTORY_FACETS);
  const [sort, setSort] = useState<DirectorySort>("name-asc");
  const [page, setPage] = useState(1);
  const { items: departments } = useDepartments();
  const { items: designations } = useDesignations();
  const { data, isPending, isError, refetch } = useAllEmployees();

  // Any search/filter/sort change restarts at page 1 (adjusted during render, not in an effect).
  const listKey = `${search}|${status}|${facets.departmentId}|${facets.designationId}|${sort}`;
  const [settledListKey, setSettledListKey] = useState(listKey);
  const listChanged = listKey !== settledListKey;
  if (listChanged) {
    setSettledListKey(listKey);
    setPage(1);
  }

  const departmentOptions = useMemo(() => catalogOptions(departments), [departments]);
  const designationOptions = useMemo(() => catalogOptions(designations), [designations]);

  const rows = useMemo<DirectoryRow[]>(() => {
    const departmentNames = new Map(departments.map((item) => [item.id, item.name]));
    const designationNames = new Map(designations.map((item) => [item.id, item.name]));
    const query = search.trim().toLowerCase();
    const matching = sortEmployees(
      (data?.items ?? []).filter((employee) => matchesDirectoryFilters(employee, status, facets)),
      sort,
    ).map((employee) => ({
      employee,
      department:
        (employee.departmentId != null ? departmentNames.get(employee.departmentId) : undefined) ??
        employee.department,
      designation:
        employee.designation ||
        (employee.designationId != null ? (designationNames.get(employee.designationId) ?? "") : ""),
    }));
    return query ? matching.filter((row) => rowMatches(row, query)) : matching;
  }, [data?.items, departments, designations, search, status, facets, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(listChanged ? 1 : page, pageCount);
  if (!listChanged && currentPage !== page) setPage(currentPage);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = pageRows.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = pageRows.length > 0 ? rangeStart + pageRows.length - 1 : 0;
  const facetsActive = Boolean(facets.departmentId || facets.designationId);
  const total = data?.items.length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card padding="16px 18px" style={{ gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em" }}>Employees</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
            {canUpdate && canDelete
              ? "Open a record to edit its details or remove the employee."
              : canUpdate
                ? "Open a record to edit its details."
                : "Open a record to view its details. Changes are limited to administrators."}
          </p>
        </div>
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
              placeholder="Search name, code, CNIC, phone, designation, or department"
              aria-label="Search employees"
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
            {data ? `${rows.length} of ${total}` : "—"}
          </span>
        </div>
        <ListToolbar
          tabs={
            <SegmentedControl
              size="sm"
              ariaLabel="Filter employees by status"
              options={[...DIRECTORY_STATUS_TABS]}
              value={status}
              onChange={(value) => setStatus(value as DirectoryStatus)}
            />
          }
          onClear={facetsActive ? () => setFacets(EMPTY_DIRECTORY_FACETS) : undefined}
        >
          <FilterSelect
            icon="building"
            label="Department"
            allLabel="All departments"
            options={departmentOptions}
            value={facets.departmentId}
            onChange={(departmentId) => setFacets((prev) => ({ ...prev, departmentId }))}
          />
          <FilterSelect
            icon="briefcase"
            label="Designation"
            allLabel="All designations"
            options={designationOptions}
            value={facets.designationId}
            onChange={(designationId) => setFacets((prev) => ({ ...prev, designationId }))}
          />
          <FilterSelect
            icon="arrow-up-down"
            label="Sort by"
            options={DIRECTORY_SORT_OPTIONS}
            value={sort}
            onChange={(value) => setSort(value as DirectorySort)}
          />
        </ListToolbar>
      </Card>

      {isError ? (
        <Card padding="28px" style={{ alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-body)" }}>
            Could not load employees.
          </span>
          <Button size="sm" icon="refresh-cw" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : isPending ? (
        <Card padding={18}>
          <SkeletonRows rows={8} height={44} />
        </Card>
      ) : rows.length === 0 ? (
        <Card padding={0}>
          <EmptyState
            message={
              total === 0
                ? "No employees yet"
                : search.trim()
                  ? "No employees match that search"
                  : facetsActive
                    ? "No employees match these filters"
                    : "No employees with that status"
            }
            icon="search-x"
          />
        </Card>
      ) : (
        <>
          {isDesktop ? <DirectoryTable rows={pageRows} /> : <DirectoryCards rows={pageRows} />}
          <DirectoryPagination
            page={currentPage}
            pageCount={pageCount}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={rows.length}
            onSelect={(next) => setPage(Math.min(Math.max(1, next), pageCount))}
          />
        </>
      )}
    </div>
  );
}

function StatusBadge({ employee }: { employee: Employee }) {
  const slug = statusOf(employee);
  return (
    <Badge tone={slug ? STATUS_TONES[slug] : "neutral"} dot>
      {slug ? STATUS_LABELS[slug] : orDash(employee.employmentStatus)}
    </Badge>
  );
}

function DirectoryTable({ rows }: { rows: DirectoryRow[] }) {
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
            minWidth: TABLE_MIN_WIDTH,
          }}
        >
          <span>Employee</span>
          <span>Emp code</span>
          <span>Att code</span>
          <span>CNIC</span>
          <span>Designation</span>
          <span>Department</span>
          <span>Shift</span>
          <span>Status</span>
          <span aria-hidden />
        </div>
        {rows.map(({ employee, department, designation }) => (
          <Link
            key={employee.id}
            href={ROUTES.profileFor(employee.id)}
            prefetch={false}
            className="ft-directory-row"
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 12,
              alignItems: "center",
              padding: "12px 18px",
              borderBottom: "1px solid var(--border-subtle)",
              minWidth: TABLE_MIN_WIDTH,
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <EmployeePhoto name={employee.name} photoPath={employee.photoPath} size={40} />
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
                {employee.name}
              </span>
            </span>
            <Cell mono>{orDash(employee.employeeCode)}</Cell>
            <Cell mono>{orDash(employee.attendanceCode)}</Cell>
            <Cell mono>{orDash(employee.cnic)}</Cell>
            <Cell>{orDash(designation)}</Cell>
            <Cell>{orDash(department)}</Cell>
            <Cell mono>{shiftLabel(employee)}</Cell>
            <span>
              <StatusBadge employee={employee} />
            </span>
            <RowNavIndicator />
          </Link>
        ))}
      </div>
    </Card>
  );
}

function DirectoryCards({ rows }: { rows: DirectoryRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map(({ employee, department, designation }) => (
        <Link
          key={employee.id}
          href={ROUTES.profileFor(employee.id)}
          prefetch={false}
          style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
        >
          <Card padding="14px 16px" style={{ gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <EmployeePhoto name={employee.name} photoPath={employee.photoPath} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-strong)" }}>{employee.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
                  {employee.employeeCode}
                </div>
              </div>
              <StatusBadge employee={employee} />
              <RowNavIndicator />
            </div>
            <Field label="Attendance code" value={orDash(employee.attendanceCode)} />
            <Field label="CNIC" value={orDash(employee.cnic)} />
            <Field label="Designation" value={orDash(designation)} />
            <Field label="Department" value={orDash(department)} />
            <Field label="Shift" value={shiftLabel(employee)} />
          </Card>
        </Link>
      ))}
    </div>
  );
}

function DirectoryPagination({
  page,
  pageCount,
  rangeStart,
  rangeEnd,
  total,
  onSelect,
}: {
  page: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onSelect: (page: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
        Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of {total.toLocaleString()}
      </span>
      <nav aria-label="Employee pages" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Button variant="ghost" size="sm" icon="chevron-left" disabled={page <= 1} onClick={() => onSelect(page - 1)}>
          Prev
        </Button>
        {getPageWindow(page, pageCount).map((number) => (
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

/** Enrollment photo from `photo_path`. Initials when there's none, or the file fails to load. */
function EmployeePhoto({ name, photoPath, size }: { name: string; photoPath: string | null; size: number }) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const src = employeePhotoUrl(photoPath);
  const failed = photoPath != null && failedPath === photoPath;

  if (!src || failed) return <Avatar name={name} size={size} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailedPath(photoPath)}
      style={{ width: size, height: size, flex: "none", borderRadius: 11, objectFit: "cover", display: "block" }}
    />
  );
}
