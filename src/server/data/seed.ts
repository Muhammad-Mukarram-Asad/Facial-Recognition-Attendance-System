import type {
  AttendanceStatus,
  DayMark,
  Department,
  EmploymentStatus,
  Shift,
} from "@/shared/types";

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: Department;
  shift: Shift;
  employmentStatus: EmploymentStatus;
  email: string;
  phone: string;
  cnic: string;
  joiningDate: string;
  dateOfBirth: string;
  reportingManager: string;
  gateCamera: string;
  gracePeriodMinutes: number;
  weeklyOff: string;
  overtimeEligible: boolean;
  exemptFromLatePenalty: boolean;
  absenceSmsToManager: boolean;
  enrolledAngles: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: string | null;
  status: AttendanceStatus;
  camera: string;
  confidence: number | null;
}

/** Roster and gate log, transcribed from the FaceTrack design dataset. */
const ROSTER: Array<[string, string, string, Department]> = [
  ["Affan Zahoor", "LTM-01204", "Loom Operator", "Weaving"],
  ["Dawood Hassan", "LTM-01310", "Quality Inspector", "Quality Control"],
  ["Shayan Peerzada", "LTM-00982", "Maintenance Fitter", "Maintenance"],
  ["Zayaan Veqar", "LTM-01147", "Shift Supervisor", "Spinning — LTM-6"],
  ["Sennan Desouza", "LTM-00733", "Store Keeper", "Administration"],
  ["Haseeb Naeem", "LTM-00621", "Security Guard", "Security"],
  ["Ammar Ahmed", "LTM-01055", "Ring Frame Operator", "Spinning — LTM-6"],
  ["Imran Qureshi", "LTM-00412", "Ring Frame Operator", "Spinning — LTM-6"],
  ["Sana Bibi", "LTM-00318", "Quality Inspector", "Quality Control"],
  ["Adeel Shah", "LTM-00877", "Shift Supervisor", "Weaving"],
  ["Hafiz Naveed", "LTM-00145", "Security Guard", "Security"],
  ["Rabia Aslam", "LTM-01022", "Doffer", "Spinning — LTM-6"],
  ["Kashif Mehmood", "LTM-00563", "Maintenance Fitter", "Maintenance"],
  ["Nadia Iqbal", "LTM-00790", "HR Coordinator", "Administration"],
  ["Tariq Javed", "LTM-00231", "Loom Operator", "Weaving"],
  ["Zubair Ahmed", "LTM-00694", "Store Keeper", "Administration"],
  ["Faiza Nawaz", "LTM-00908", "Lab Technician", "Quality Control"],
  ["Usman Ghani", "LTM-00457", "Electrician", "Maintenance"],
  ["Shaista Parveen", "LTM-01188", "Packing Operator", "Spinning — LTM-6"],
];

const GATE_LOG: Array<
  [string | null, string | null, string | null, AttendanceStatus]
> = [
  ["07:46:22", "17:02:41", "9h 16m", "Present"],
  ["08:19:03", "17:08:55", "8h 49m", "Late"],
  ["06:51:37", "15:04:12", "8h 12m", "Present"],
  ["07:58:10", "17:12:44", "9h 14m", "Present"],
  // HIDDEN — leave management. Was "On Leave"; treated as an ordinary absence now.
  [null, null, null, "Absent"],
  [null, null, null, "Absent"],
  ["08:37:29", "17:26:18", "8h 48m", "Late"],
  ["07:52:14", "17:04:02", "8h 12m", "Present"],
  ["08:21:47", "17:10:33", "8h 49m", "Late"],
  ["06:58:03", "15:02:19", "8h 04m", "Present"],
  [null, null, null, "Absent"],
  ["07:48:55", "16:59:41", "8h 11m", "Present"],
  // HIDDEN — leave management. Was "On Leave"; treated as an ordinary absence now.
  [null, null, null, "Absent"],
  ["09:04:12", "18:02:55", "8h 58m", "Late"],
  ["06:55:30", "15:01:08", "8h 06m", "Present"],
  ["07:59:44", "17:00:12", "9h 00m", "Present"],
  [null, null, null, "Absent"],
  ["07:41:09", "16:44:50", "9h 03m", "Present"],
  ["08:33:21", "17:20:04", "8h 46m", "Late"],
];

const SHIFTS: Shift[] = ["General — 09:00 to 17:00"];

const CAMERAS = ["nvr4 d12 Gate 2", "nvr2 d03 Gate 1", "nvr7 d21 Admin Block"];

const MANAGERS = [
  "Shahid Mehmood",
  "Nadia Iqbal",
  "Adeel Shah",
  "Zayaan Veqar",
];

function slug(employeeId: string): string {
  return employeeId.toLowerCase();
}

export const ATTENDANCE_DATE = "2026-09-09";

export const employees: EmployeeRecord[] = ROSTER.map(
  ([name, employeeId, designation, department], i) => ({
    id: slug(employeeId),
    employeeId,
    name,
    designation,
    department,
    shift: SHIFTS[i % SHIFTS.length],
    employmentStatus: (i % 11 === 4
      ? "Probation"
      : "Active") as EmploymentStatus,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@ltm.com`,
    phone: `+92 3${String(10 + (i % 80)).padStart(2, "0")} ${String(1000000 + i * 7919).slice(0, 7)}`,
    cnic: `42101-${String(1000000 + i * 4211).slice(0, 7)}-${(i % 9) + 1}`,
    joiningDate: `${String((i % 28) + 1).padStart(2, "0")}/0${(i % 9) + 1}/202${i % 5}`,
    dateOfBirth: `${String((i % 27) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/19${80 + (i % 18)}`,
    reportingManager: MANAGERS[i % MANAGERS.length],
    gateCamera: CAMERAS[i % CAMERAS.length],
    gracePeriodMinutes: 10,
    weeklyOff: "Sunday",
    overtimeEligible: i % 4 !== 0,
    exemptFromLatePenalty: i % 7 === 0,
    absenceSmsToManager: true,
    enrolledAngles: i === 6 ? 1 : 3,
    createdAt: new Date(Date.UTC(2026, 8, 9 - (i % 9), 9, 0, 0)).toISOString(),
  }),
);

export const attendance: AttendanceRecord[] = employees.map((employee, i) => {
  const [checkIn, checkOut, hours, status] = GATE_LOG[i];
  return {
    id: `${employee.id}-${ATTENDANCE_DATE}`,
    employeeId: employee.employeeId,
    date: ATTENDANCE_DATE,
    checkIn,
    checkOut,
    hours,
    status,
    camera: employee.gateCamera,
    confidence: checkIn
      ? Number((0.9 + ((i * 13) % 9) / 100).toFixed(2))
      : null,
  };
});

/** 30-day history used on the employee profile heat map. */
// HIDDEN — leave management. Was "ppplpApppalppplppApplpalppplpp" (A = leave); leave marks folded into "absent".
export const MONTH_PATTERN = "ppplpapppalppplppapplpalppplpp";

export const MARK_BY_CHAR: Record<string, DayMark> = {
  p: "present",
  l: "late",
  a: "absent",
  // HIDDEN — leave management.
  // A: "leave",
};

export interface LeaveRecord {
  id: string;
  employeeId: string;
  name: string;
  reason: string;
  startDate: string;
  endDate: string;
  dates: string;
  days: string;
  type: "Casual" | "Medical" | "Annual" | "Special";
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
}

export const leaveRequests: LeaveRecord[] = [
  {
    id: "lv-001",
    employeeId: "LTM-00563",
    name: "Kashif Mehmood",
    reason: "Family wedding in Multan",
    startDate: "2026-09-12",
    endDate: "2026-09-14",
    dates: "12 Sep — 14 Sep 2026",
    days: "3 days",
    type: "Casual",
    status: "Pending",
    submittedAt: "2026-09-04T08:12:00.000Z",
  },
  {
    id: "lv-002",
    employeeId: "LTM-00908",
    name: "Faiza Nawaz",
    reason: "Medical — surgery follow-up",
    startDate: "2026-09-15",
    endDate: "2026-09-22",
    dates: "15 Sep — 22 Sep 2026",
    days: "8 days",
    type: "Medical",
    status: "Pending",
    submittedAt: "2026-09-06T11:40:00.000Z",
  },
  {
    id: "lv-003",
    employeeId: "LTM-00790",
    name: "Nadia Iqbal",
    reason: "Childcare",
    startDate: "2026-09-11",
    endDate: "2026-09-11",
    dates: "11 Sep 2026",
    days: "1 day",
    type: "Casual",
    status: "Pending",
    submittedAt: "2026-09-08T06:05:00.000Z",
  },
  {
    id: "lv-004",
    employeeId: "LTM-00457",
    name: "Usman Ghani",
    reason: "Annual leave",
    startDate: "2026-09-20",
    endDate: "2026-09-30",
    dates: "20 Sep — 30 Sep 2026",
    days: "11 days",
    type: "Annual",
    status: "Pending",
    submittedAt: "2026-09-08T13:22:00.000Z",
  },
  {
    id: "lv-005",
    employeeId: "LTM-00231",
    name: "Tariq Javed",
    reason: "Bereavement",
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    dates: "10 Sep — 12 Sep 2026",
    days: "3 days",
    type: "Special",
    status: "Pending",
    submittedAt: "2026-09-09T05:30:00.000Z",
  },
];

export interface NotificationRecord {
  id: string;
  kind: "leave" | "alert" | "hr" | "reminder" | "enroll";
  title: string;
  body: string;
  time: string;
  priority: "high" | "medium" | "low";
  read: boolean;
}

export const notifications: NotificationRecord[] = [
  {
    id: "nt-1",
    kind: "leave",
    title: "Leave request — Shayan Peerzada",
    body: "3 days casual, 12 Sep — 14 Sep. Awaiting your approval.",
    time: "4 min ago",
    priority: "high",
    read: false,
  },
  {
    id: "nt-2",
    kind: "leave",
    title: "Leave request — Dawood Hassan",
    body: "8 days medical, 15 Sep — 22 Sep. Doctor note attached.",
    time: "26 min ago",
    priority: "high",
    read: false,
  },
  {
    id: "nt-3",
    kind: "alert",
    title: "Haseeb Naeem marked absent",
    body: "No gate match by 09:30 on nvr2 d03 Gate 1.",
    time: "1 hr ago",
    priority: "medium",
    read: false,
  },
  {
    id: "nt-4",
    kind: "hr",
    title: "HR: shift roster for week 38 needs sign-off",
    body: "Submitted by Nadia Iqbal for the Spinning floor.",
    time: "3 hrs ago",
    priority: "medium",
    read: false,
  },
  {
    id: "nt-5",
    kind: "reminder",
    title: "Monthly register due Friday",
    body: "August attendance export has not been generated yet.",
    time: "Yesterday",
    priority: "low",
    read: false,
  },
  {
    id: "nt-6",
    kind: "enroll",
    title: "Face enrollment incomplete — Ammar Ahmed",
    body: "Only the front angle was captured at the kiosk.",
    time: "Yesterday",
    priority: "low",
    read: false,
  },
];

/** Live gate stream shown on the dashboard. */
export const clockInStream = [
  {
    name: "Affan Zahoor",
    camera: "nvr4 d12 Gate 2",
    time: "07:46:22 am",
    late: false,
  },
  {
    name: "Dawood Hassan",
    camera: "nvr4 d12 Gate 2",
    time: "08:19:03 am",
    late: true,
  },
  {
    name: "Shayan Peerzada",
    camera: "nvr2 d03 Gate 1",
    time: "06:51:37 am",
    late: false,
  },
  {
    name: "Zayaan Veqar",
    camera: "nvr4 d12 Gate 2",
    time: "07:58:10 am",
    late: false,
  },
  {
    name: "Ammar Ahmed",
    camera: "nvr2 d03 Gate 1",
    time: "08:37:29 am",
    late: true,
  },
  {
    name: "Sennan Desouza",
    camera: "nvr7 d21 Admin Block",
    time: "07:59:44 am",
    late: false,
  },
];

/** Employees flagged by the attendance risk index. */
export const riskList = [
  {
    name: "Haseeb Naeem",
    employeeId: "LTM-00621",
    meta: "6 absences · 4 late · Security",
    score: 82,
  },
  {
    name: "Ammar Ahmed",
    employeeId: "LTM-01055",
    meta: "5 absences · 6 late · Spinning — LTM-6",
    score: 74,
  },
  {
    name: "Dawood Hassan",
    employeeId: "LTM-01310",
    meta: "3 absences · 9 late · Quality Control",
    score: 68,
  },
  {
    name: "Shayan Peerzada",
    employeeId: "LTM-00982",
    meta: "4 absences · 3 late · Maintenance",
    score: 55,
  },
  {
    name: "Nadia Iqbal",
    employeeId: "LTM-00790",
    meta: "2 absences · 7 late · Administration",
    score: 47,
  },
];

/** Hourly check-in curve, 05:00 → 14:00. */
export const hourlyCheckIns = [
  { hour: "05", count: 34 },
  { hour: "06", count: 96 },
  { hour: "07", count: 268 },
  { hour: "08", count: 412 },
  { hour: "09", count: 338 },
  { hour: "10", count: 176 },
  { hour: "11", count: 92 },
  { hour: "12", count: 138 },
  { hour: "13", count: 74 },
  { hour: "14", count: 38 },
];

/** Punctuality split for the current week — working days only (Mon–Fri). */
export const weeklyPunctuality = [
  { day: "MON", onTime: 88, late: 14, absent: 18 },
  { day: "TUE", onTime: 96, late: 10, absent: 12 },
  { day: "WED", onTime: 74, late: 22, absent: 24 },
  { day: "THU", onTime: 102, late: 12, absent: 8 },
  { day: "FRI", onTime: 66, late: 26, absent: 30 },
];

export const absenceByDepartment = [
  { department: "Spinning — LTM-6", count: 412, share: 78 },
  { department: "Weaving", count: 298, share: 56 },
  { department: "Quality Control", count: 181, share: 34 },
  { department: "Maintenance", count: 117, share: 22 },
  { department: "Security", count: 64, share: 12 },
];

export const savedReports = [
  {
    id: "rp-1",
    name: "August 2026 — monthly register",
    format: "xlsx",
    size: "2.4 MB",
  },
  {
    id: "rp-2",
    name: "Late arrivals — week 36",
    format: "pdf",
    size: "640 KB",
  },
  { id: "rp-3", name: "Overtime ledger — Q3", format: "xlsx", size: "1.1 MB" },
];

export const recentPunches = [
  {
    kind: "Check in — matched",
    camera: "nvr4 d12 Gate 2 · 0.97",
    time: "07:52:14 am",
  },
  // HIDDEN — break in / break out punches.
  // { kind: 'Break out', camera: 'nvr4 d14 Canteen 1 · 0.95', time: '12:30:08 pm' },
  // { kind: 'Break in', camera: 'nvr4 d14 Canteen 1 · 0.96', time: '13:02:41 pm' },
  {
    kind: "Check out — matched",
    camera: "nvr4 d12 Gate 2 · 0.98",
    time: "05:04:02 pm",
  },
  {
    kind: "Check in — matched",
    camera: "nvr4 d12 Gate 2 · 0.94",
    time: "Yesterday 07:49 am",
  },
];

/** Headline figures for a 100-strong workforce. */
export const WORKFORCE = {
  total: 100,
  active: 88,
  present: 88,
  onTime: 80,
  late: 8,
  absent: 12,
  presentRate: 88.0,
  enrolledFaces: 97,
  gateCameras: 6,
  matchAccuracy: 99.2,
  // DUMMY — replace with the strangers/watchlist feed once that API is integrated.
  strangersDetected: 5,
  blacklistedAttempts: 2,
};

/** Short codes for the gate cameras in `CAMERAS`, e.g. "nvr4 d12 Gate 2" -> "nvr4g2". */
export const CAMERA_CODES: Record<string, string> = {
  'nvr4 d12 Gate 2': 'nvr4g2',
  'nvr2 d03 Gate 1': 'nvr2g1',
  'nvr7 d21 Admin Block': 'nvr7ab',
};

/** DUMMY — per-camera breakdown for the strangers/blacklisted stat cards. Each
 *  list's counts sum to WORKFORCE.strangersDetected / blacklistedAttempts. */
export const STRANGERS_BY_CAMERA = [
  { camera: CAMERA_CODES['nvr4 d12 Gate 2'], count: 3 },
  { camera: CAMERA_CODES['nvr2 d03 Gate 1'], count: 2 },
];

export const BLACKLISTED_BY_CAMERA = [
  { camera: CAMERA_CODES['nvr2 d03 Gate 1'], count: 1 },
  { camera: CAMERA_CODES['nvr7 d21 Admin Block'], count: 1 },
];
