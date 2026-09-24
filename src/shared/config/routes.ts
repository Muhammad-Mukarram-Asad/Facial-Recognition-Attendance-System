/** Every sidebar destination is its own App Router route. */
export const ROUTES = {
  signIn: "/sign-in",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  attendance: "/attendance-records",
  employees: "/employees",
  // reports: "/reports",
  profile: "/employee-profile",
  profileFor: (employeeId: string) => `/employee-profile/${employeeId}`,

  // ── HIDDEN destinations ──────────────────────────────────────────────
  // Both paths still resolve, but their pages redirect and neither appears
  // in the sidebar. The constants stay so the dormant feature components
  // keep compiling; restoring a flow is then a one-line change below.
  //
  //   signUp  — self-service registration is off. Accounts are provisioned
  //             by the backend team and handed to the client.
  //   leave   — leave management is hidden for this release.
  signUp: "/sign-up",
  leave: "/leave-requests",
  // ─────────────────────────────────────────────────────────────────────
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
    id: "employees",
    label: "Add Employee",
    icon: "user-round-plus",
    href: ROUTES.employees,
  },
  // HIDDEN — leave management.
  // { id: 'leave', label: 'Leave Requests', icon: 'calendar-check', href: ROUTES.leave },
  // {
  //   id: "reports",
  //   label: "Reports",
  //   icon: "file-chart-column",
  //   href: ROUTES.reports,
  // },
  {
    id: "profile",
    label: "Employees",
    icon: "users",
    href: ROUTES.profile,
  },
];

/** Breadcrumb + title pairs shown in the topbar, keyed by route. */
export const PAGE_META: Record<string, { crumb: string; title: string }> = {
  [ROUTES.dashboard]: { crumb: "Overview", title: "Attendance analytics" },
  [ROUTES.attendance]: { crumb: "Attendance", title: "Daily records" },
  [ROUTES.employees]: { crumb: "Workforce", title: "Add employee" },
  [ROUTES.profile]: { crumb: "Workforce", title: "Employees" },
  // [ROUTES.reports]: { crumb: "Exports", title: "Reports" },
  // HIDDEN — leave management.
  // [ROUTES.leave]: { crumb: 'Requests', title: 'Leave approvals' },
};
