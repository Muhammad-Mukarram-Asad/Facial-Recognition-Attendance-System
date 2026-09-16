import type { NextRequest } from 'next/server';

import { attendanceRowSchema } from '@/features/attendance/types';
import { WORKFORCE } from '@/server/data/seed';
import { paginate } from '@/server/lib/paginate';
import { handleRouteError, ok } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';
import { orDash, serial } from '@/shared/lib/format';

const SEARCHABLE = ['name', 'employeeId', 'designation', 'department', 'status'] as const;

function buildRows() {
  const store = getStore();
  const byId = new Map(store.employees.map((employee) => [employee.employeeId, employee]));

  return store.attendance
    .filter((record) => byId.has(record.employeeId))
    .map((record, index) => {
      const employee = byId.get(record.employeeId)!;
      return {
        id: record.id,
        serial: serial(index),
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        checkIn: orDash(record.checkIn),
        checkOut: orDash(record.checkOut),
        hours: orDash(record.hours),
        status: record.status,
        camera: record.camera,
        confidence: record.confidence,
      };
    });
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const search = (params.get('search') ?? '').trim().toLowerCase();
    const column = params.get('column') ?? 'all';
    const status = params.get('status') ?? 'All';
    const page = Number(params.get('page') ?? 1);
    const pageSize = Number(params.get('pageSize') ?? 10);

    let rows = buildRows();

    if (status !== 'All') rows = rows.filter((row) => row.status === status);

    if (search) {
      const fields = column === 'all' ? SEARCHABLE : [column as (typeof SEARCHABLE)[number]];
      rows = rows.filter((row) =>
        fields.some((field) => String(row[field] ?? '').toLowerCase().includes(search)),
      );
    }

    const pageData = paginate(rows, page, pageSize);
    return ok({ ...pageData, rosterTotal: WORKFORCE.total });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Bulk status override from the records table's action bar. */
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { ids: string[]; status: string };
    // Reject anything outside the current status set — an unvalidated write
    // here is exactly how a retired status (e.g. the old "On Leave") could
    // get baked back into the store and later fail the GET response schema.
    const status = attendanceRowSchema.shape.status.parse(body.status);
    const { ids } = body;
    const store = getStore();

    for (const record of store.attendance) {
      if (!ids.includes(record.id)) continue;
      record.status = status;
      if (status === 'Present' && !record.checkIn) {
        record.checkIn = '08:00:00';
        record.checkOut = '17:00:00';
        record.hours = '9h 00m';
      }
      if (status === 'Absent' /* HIDDEN — leave management. || status === 'On Leave' */) {
        record.checkIn = null;
        record.checkOut = null;
        record.hours = null;
      }
    }

    const rows = buildRows();
    return ok({ ...paginate(rows, 1, 10), rosterTotal: WORKFORCE.total });
  } catch (error) {
    return handleRouteError(error);
  }
}
