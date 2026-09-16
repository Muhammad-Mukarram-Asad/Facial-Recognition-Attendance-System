import type { NextRequest } from "next/server";

import { MARK_BY_CHAR, MONTH_PATTERN, recentPunches } from "@/server/data/seed";
import { handleRouteError, notFound, ok } from "@/server/lib/response";
import { getStore } from "@/server/lib/store";

type Context = { params: Promise<{ employeeId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { employeeId } = await context.params;
    const store = getStore();

    const employee = store.employees.find(
      (candidate) =>
        candidate.employeeId.toLowerCase() === employeeId.toLowerCase(),
    );
    if (!employee) return notFound("Employee not found");

    const record = store.attendance.find(
      (entry) => entry.employeeId === employee.employeeId,
    );
    const history = MONTH_PATTERN.split("").map((char) => MARK_BY_CHAR[char]);

    const late = history.filter((mark) => mark === "late").length;
    const absences = history.filter((mark) => mark === "absent").length;
    const present = history.filter(
      (mark) => mark === "present" || mark === "late",
    ).length;

    return ok({
      employeeId: employee.employeeId,
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
      status: record?.status ?? "Absent",
      gateCamera: employee.gateCamera,
      stats: {
        attendanceRate: `${((present / history.length) * 100).toFixed(1)}%`,
        lateArrivals: String(late),
        absences: String(absences),
        averageHours: "8h 34m",
      },
      history,
      historyLabel: "10 Aug — 15 Sep",
      punches: recentPunches,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
