import { toEmployeeStatusSlug, type Employee, type EmployeeStatusSlug } from "@/features/employees/types";

export const DIRECTORY_STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blacklisted", label: "Blacklisted" },
  { value: "vip", label: "VIP" },
] as const;

export type DirectoryStatus = (typeof DIRECTORY_STATUS_TABS)[number]["value"];

export const DIRECTORY_SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "code-asc", label: "Employee code (low to high)" },
  { value: "code-desc", label: "Employee code (high to low)" },
] as const;

export type DirectorySort = (typeof DIRECTORY_SORT_OPTIONS)[number]["value"];

/** Department / designation ids as select values; "" means all. */
export interface DirectoryFacets {
  departmentId: string;
  designationId: string;
}

export const EMPTY_DIRECTORY_FACETS: DirectoryFacets = { departmentId: "", designationId: "" };

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export function statusOf(employee: Employee): EmployeeStatusSlug | null {
  return toEmployeeStatusSlug(employee.employmentStatus);
}

export function matchesDirectoryFilters(
  employee: Employee,
  status: DirectoryStatus,
  facets: DirectoryFacets,
): boolean {
  if (status !== "all" && statusOf(employee) !== status) return false;
  if (facets.departmentId && String(employee.departmentId ?? "") !== facets.departmentId) return false;
  if (facets.designationId && String(employee.designationId ?? "") !== facets.designationId) return false;
  return true;
}

export function sortEmployees(employees: Employee[], sort: DirectorySort): Employee[] {
  const byName = (a: Employee, b: Employee) => collator.compare(a.name, b.name);
  // Numeric collation: "E-9" sorts before "E-10".
  const byCode = (a: Employee, b: Employee) => collator.compare(a.employeeCode, b.employeeCode);
  const [primary, secondary] = sort.startsWith("name") ? [byName, byCode] : [byCode, byName];
  const direction = sort.endsWith("desc") ? -1 : 1;
  return [...employees].sort((a, b) => direction * (primary(a, b) || secondary(a, b)));
}

/** Catalog items as select options, A–Z. */
export function catalogOptions(items: readonly { id: number; name: string }[]) {
  return [...items]
    .sort((a, b) => collator.compare(a.name, b.name))
    .map((item) => ({ value: String(item.id), label: item.name }));
}
