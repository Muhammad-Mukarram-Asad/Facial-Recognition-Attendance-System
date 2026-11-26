import type { AttendanceRecord } from "../types";

export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "id-asc", label: "ID (low to high)" },
  { value: "id-desc", label: "ID (high to low)" },
] as const;

export type RegisterSort = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: RegisterSort = "name-asc";

/** "" means every department / designation. */
export interface RegisterFacets {
  department: string;
  designation: string;
}

export const EMPTY_FACETS: RegisterFacets = { department: "", designation: "" };

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function sameName(a: string, b: string): boolean {
  return collator.compare(a, b) === 0;
}

/**
 * Every catalog name (GET /departments/full or /designations/full), plus any
 * name that appears only on the day's rows — case-insensitively de-duplicated,
 * catalog spelling first, sorted A–Z.
 */
export function facetOptions(
  catalog: readonly { name: string }[],
  records: AttendanceRecord[],
  pick: (record: AttendanceRecord) => string | null,
): string[] {
  const byKey = new Map<string, string>();
  const add = (raw: string | null | undefined) => {
    const name = clean(raw);
    const key = name.toLocaleLowerCase();
    if (name && !byKey.has(key)) byKey.set(key, name);
  };
  for (const item of catalog) add(item.name);
  for (const record of records) add(pick(record));
  return [...byKey.values()].sort(collator.compare);
}

export function matchesFacets(record: AttendanceRecord, facets: RegisterFacets): boolean {
  if (facets.department && !sameName(clean(record.department), facets.department)) return false;
  if (facets.designation && !sameName(clean(record.designation), facets.designation)) return false;
  return true;
}

export function sortRecords(records: AttendanceRecord[], sort: RegisterSort): AttendanceRecord[] {
  const byName = (a: AttendanceRecord, b: AttendanceRecord) => collator.compare(a.name, b.name);
  const byId = (a: AttendanceRecord, b: AttendanceRecord) => a.employee_id - b.employee_id;
  const [primary, secondary] = sort.startsWith("name") ? [byName, byId] : [byId, byName];
  const direction = sort.endsWith("desc") ? -1 : 1;
  return [...records].sort((a, b) => direction * (primary(a, b) || secondary(a, b)));
}
