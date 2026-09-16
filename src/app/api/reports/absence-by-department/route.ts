import type { NextRequest } from 'next/server';

import { absenceByDepartment } from '@/server/data/seed';
import { handleRouteError, ok } from '@/server/lib/response';

export async function GET(request: NextRequest) {
  try {
    const department = request.nextUrl.searchParams.get('department') ?? 'All departments';

    const rows =
      department === 'All departments'
        ? absenceByDepartment
        : absenceByDepartment.filter((row) => row.department === department);

    return ok(rows);
  } catch (error) {
    return handleRouteError(error);
  }
}
