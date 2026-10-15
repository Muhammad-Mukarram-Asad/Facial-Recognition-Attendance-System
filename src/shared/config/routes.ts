/** Every sidebar destination is its own App Router route. */
export const ROUTES = {
  signIn: "/sign-in",
  dashboard: "/dashboard",
  attendance: "/attendance-records",
  employees: "/employees",
  profile: "/employee-profile",
  profileFor: (employeeId: string) => `/employee-profile/${employeeId}`,
} as const;

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard",
    href: ROUTES.dashboard,
  },
  {
    id: "records",
    label: "Attendance Records",
    icon: "table-2",
    href: ROUTES.attendance,
  },
  {
    id: "profile",
    label: "Employees",
    icon: "users",
    href: ROUTES.profile,
  },
  {
    id: "employees",
    label: "Add Employee",
    icon: "user-round-plus",
    href: ROUTES.employees,
  },
];

/** Breadcrumb + title pairs shown in the topbar, keyed by route. */
export const PAGE_META: Record<string, { crumb: string; title: string }> = {
  [ROUTES.dashboard]: { crumb: "Overview", title: "Attendance analytics" },
  [ROUTES.attendance]: { crumb: "Attendance", title: "Daily records" },
  [ROUTES.employees]: { crumb: "Workforce", title: "Add employee" },
  [ROUTES.profile]: { crumb: "Workforce", title: "Employees" },
};
