"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useAllEmployees } from "@/features/employees/hooks/useEmployees";
import type { Employee } from "@/features/employees/types";
import { ROUTES } from "@/shared/config/routes";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Icon,
  SkeletonRows,
} from "@/shared/ui";

import { RowNavIndicator } from "./RowNavIndicator";

// Change this to request more/fewer rows per page from the real backend.
const PAGE_SIZE = 30;

// How many rows are visible before the list scrolls internally — keeps
// the header/search bar fixed in place while the roster scrolls under it.
const LIST_MAX_HEIGHT = 480;

const MAX_PAGE_BUTTONS = 5;

/** A sliding window of up to 5 page numbers, centered on the current page
 * and clamped to the valid range — e.g. page 7 of 20 -> [5, 6, 7, 8, 9]. */
function employeeMatches(employee: Employee, query: string): boolean {
  return [
    employee.name,
    employee.id,
    employee.employeeCode,
    employee.email,
    employee.phone,
    employee.cnic,
    employee.designation,
    employee.department,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function getPageWindow(current: number, total: number, size = MAX_PAGE_BUTTONS): number[] {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(size / 2));
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Landing view for /employee-profile — the sidebar's "Employees" destination.
 * Lists the roster. The API returns the whole list; search filters a copy
 * of that list in the browser. Opening one goes to its edit screen.
 */
export function ProfileDirectory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // A new search always starts back at page 1 — adjusted during render
  // (React's recommended pattern for this) rather than in an effect, so it
  // takes effect in the same render instead of causing an extra one.
  const [settledSearch, setSettledSearch] = useState(search);
  const searchChanged = search !== settledSearch;
  if (searchChanged) {
    setSettledSearch(search);
    setPage(1);
  }

  const { data, isPending } = useAllEmployees();
  const filtered = useMemo(() => {
    const roster = [...(data?.items ?? [])];
    const query = search.trim().toLowerCase();
    if (!query) return roster;
    return roster.filter((employee) => employeeMatches(employee, query));
  }, [data?.items, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(searchChanged ? 1 : page, pageCount);
  if (!searchChanged && currentPage !== page) setPage(currentPage);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = pageItems.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = pageItems.length > 0 ? rangeStart + pageItems.length - 1 : 0;

  return (
    <Card padding={22} style={{ gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Employees
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
          Open a record to edit its details or remove the employee.
        </p>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border-default)",
        }}
      >
        <Icon name="search" size={17} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, code, email, phone, CNIC, designation, or department"
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

      {isPending ? (
        <SkeletonRows rows={6} height={44} />
      ) : data && data.items.length === 0 ? (
        <EmptyState message="No employees match that search" icon="search-x" />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: LIST_MAX_HEIGHT,
            overflowY: "auto",
          }}
        >
          {pageItems.map((employee) => (
            <Link
              key={employee.id}
              href={ROUTES.profileFor(employee.id)}
              prefetch={false}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 10px",
                margin: "0 -10px",
                border: "none",
                borderBottom: "1px solid var(--border-subtle)",
                borderRadius: 12,
                background: "transparent",
                color: "inherit",
                textDecoration: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <Avatar name={employee.name} size={38} brackets />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-strong)",
                  }}
                >
                  {employee.name}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    color: "var(--text-faint)",
                  }}
                >
                  {employee.employeeCode} · {employee.department}
                </span>
              </span>
              <RowNavIndicator />
            </Link>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            paddingTop: 14,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{" "}
            {filtered.length.toLocaleString()}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Button
              variant="ghost"
              size="sm"
              icon="chevron-left"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            {getPageWindow(currentPage, pageCount).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                style={{
                  padding: "5px 12px",
                  border: "none",
                  borderRadius: "var(--radius-pill)",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: p === currentPage ? 700 : 500,
                  background:
                    p === currentPage ? "var(--interactive-primary)" : "transparent",
                  color: p === currentPage ? "#fff" : "var(--text-muted)",
                }}
              >
                {p}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              icon="chevron-right"
              iconPosition="end"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
