import {
  attendance as attendanceSeed,
  employees as employeesSeed,
  leaveRequests as leaveSeed,
  notifications as notificationSeed,
  type AttendanceRecord,
  type EmployeeRecord,
  type LeaveRecord,
  type NotificationRecord,
} from '@/server/data/seed';

/**
 * In-memory store for the mock backend.
 *
 * Pinned to globalThis so Next's dev-mode module reloading doesn't reset
 * mutations (an approved leave stays approved across a hot reload).
 * Swap this module for a real database client and the route handlers
 * above it need no changes.
 */
interface Store {
  employees: EmployeeRecord[];
  attendance: AttendanceRecord[];
  leave: LeaveRecord[];
  notifications: NotificationRecord[];
}

const globalStore = globalThis as typeof globalThis & { __facetrackStore?: Store };

export function getStore(): Store {
  globalStore.__facetrackStore ??= {
    employees: employeesSeed.map((e) => ({ ...e })),
    attendance: attendanceSeed.map((a) => ({ ...a })),
    leave: leaveSeed.map((l) => ({ ...l })),
    notifications: notificationSeed.map((n) => ({ ...n })),
  };
  return globalStore.__facetrackStore;
}
