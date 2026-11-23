import { PERMISSIONS } from "@/shared/config/permissions";

/** Every sidebar destination is its own App Router route. */
export const ROUTES = {
  signIn: "/sign-in",
  dashboard: "/dashboard",
  attendance: "/attendance-records",
  employees: "/employees",
  profile: "/employee-profile",
  profileFor: (id: string) => `/employee-profile/${id}`,
  users: "/users",
} as const;

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  /** When set, the item is hidden unless the signed-in role includes it. */
  permission?: string;
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
    permission: PERMISSIONS.employeeCreate,
  },
  {
    id: "users",
    label: "Users",
    icon: "shield",
    href: ROUTES.users,
    permission: PERMISSIONS.userList,
  },
];

/** Breadcrumb + title pairs shown in the topbar, keyed by route. */
export const PAGE_META: Record<string, { crumb: string; title: string }> = {
  [ROUTES.dashboard]: { crumb: "Overview", title: "Attendance analytics" },
  [ROUTES.attendance]: { crumb: "Attendance", title: "Daily records" },
  [ROUTES.employees]: { crumb: "Workforce", title: "Add employee" },
  [ROUTES.profile]: { crumb: "Workforce", title: "Employees" },
  [ROUTES.users]: { crumb: "Access", title: "Users" },
};
