import type { NextRequest } from 'next/server';

import { ATTENDANCE_DATE } from '@/server/data/seed';
import { created, handleRouteError, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';
import { employeeInputSchema } from '@/features/employees/types';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const search = (params.get('search') ?? '').trim().toLowerCase();
    const limit = params.get('limit') ? Number(params.get('limit')) : undefined;

    const store = getStore();
    // Newest first — "Recently added" depends on this ordering.
    let items = [...store.employees].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (search) {
      items = items.filter(
        (employee) =>
          employee.name.toLowerCase().includes(search) ||
          employee.employeeId.toLowerCase().includes(search) ||
          employee.department.toLowerCase().includes(search),
      );
    }

    const total = items.length;
    if (limit) items = items.slice(0, limit);

    return ok({ items, total });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = employeeInputSchema.parse(await request.json());
    const store = getStore();

    if (store.employees.some((employee) => employee.employeeId === input.employeeId)) {
      return ok({ message: 'That employee ID is already enrolled' }, { status: 409 });
    }

    const employee = {
      id: input.employeeId.toLowerCase(),
      ...input,
      enrolledAngles: 3,
      createdAt: new Date().toISOString(),
    };

    store.employees.push(employee);

    // A new hire has no gate match yet, so the day starts as absent.
    store.attendance.push({
      id: `${employee.id}-${ATTENDANCE_DATE}`,
      employeeId: employee.employeeId,
      date: ATTENDANCE_DATE,
      checkIn: null,
      checkOut: null,
      hours: null,
      status: 'Absent',
      camera: employee.gateCamera || 'unassigned',
      confidence: null,
    });

    return created(employee);
  } catch (error) {
    return handleRouteError(error);
  }
}
