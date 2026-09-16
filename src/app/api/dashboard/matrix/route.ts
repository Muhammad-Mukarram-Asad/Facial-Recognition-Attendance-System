import { MARK_BY_CHAR, WEEK_PATTERNS } from '@/server/data/seed';
import { getStore } from '@/server/lib/store';
import { handleRouteError, ok } from '@/server/lib/response';

export async function GET() {
  try {
    const store = getStore();

    const rows = store.employees.slice(0, WEEK_PATTERNS.length).map((employee, index) => ({
      name: employee.name,
      employeeId: employee.employeeId,
      department: employee.department,
      days: WEEK_PATTERNS[index].split('').map((char) => MARK_BY_CHAR[char]),
    }));

    return ok(rows);
  } catch (error) {
    return handleRouteError(error);
  }
}
