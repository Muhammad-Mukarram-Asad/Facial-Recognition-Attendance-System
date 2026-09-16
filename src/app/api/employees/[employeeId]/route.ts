import type { NextRequest } from 'next/server';

import { employeeInputSchema } from '@/features/employees/types';
import { handleRouteError, notFound, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';

type Context = { params: Promise<{ employeeId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { employeeId } = await context.params;
    const store = getStore();
    const employee = store.employees.find(
      (candidate) => candidate.employeeId.toLowerCase() === employeeId.toLowerCase(),
    );
    if (!employee) return notFound('Employee not found');
    return ok(employee);
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Full-record update from the employee edit screen. Employee ID never changes. */
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { employeeId } = await context.params;
    const store = getStore();
    const index = store.employees.findIndex(
      (candidate) => candidate.employeeId.toLowerCase() === employeeId.toLowerCase(),
    );
    if (index === -1) return notFound('Employee not found');

    const input = employeeInputSchema.parse(await request.json());
    const existing = store.employees[index];
    const updated = { ...existing, ...input, employeeId: existing.employeeId };
    store.employees[index] = updated;

    return ok(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const { employeeId } = await context.params;
    const store = getStore();
    const index = store.employees.findIndex(
      (candidate) => candidate.employeeId.toLowerCase() === employeeId.toLowerCase(),
    );
    if (index === -1) return notFound('Employee not found');

    const [removed] = store.employees.splice(index, 1);
    // Drop their gate log too, so the records table stays consistent.
    store.attendance = store.attendance.filter((record) => record.employeeId !== removed.employeeId);

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
