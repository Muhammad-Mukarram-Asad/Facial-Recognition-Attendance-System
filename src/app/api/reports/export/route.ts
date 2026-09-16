import type { NextRequest } from 'next/server';

import { handleRouteError } from '@/server/lib/response';
import { getStore } from '@/server/lib/store';
import { orDash } from '@/shared/lib/format';

interface ExportBody {
  type: string;
  from: string;
  to: string;
  department: string;
  format: 'xlsx' | 'pdf';
  columns: string[];
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Generates the export server-side and streams it back as a blob.
 *
 * Emits CSV bytes for both formats — wiring a real xlsx/pdf writer only
 * changes this handler, not the client's download flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExportBody;
    const store = getStore();
    const byId = new Map(store.employees.map((employee) => [employee.employeeId, employee]));

    const header = ['Employee ID', 'Name', 'Designation', 'Department', 'Status'];
    if (body.columns.includes('times')) header.push('Check in', 'Check out');
    if (body.columns.includes('hours')) header.push('Hours');
    if (body.columns.includes('camera')) header.push('Camera', 'Confidence');
    if (body.columns.includes('leaveBalance')) header.push('Leave balance');

    const lines = [header.join(',')];

    for (const record of store.attendance) {
      const employee = byId.get(record.employeeId);
      if (!employee) continue;
      if (body.department !== 'All departments' && employee.department !== body.department) continue;

      const row = [
        employee.employeeId,
        employee.name,
        employee.designation,
        employee.department,
        record.status,
      ];
      if (body.columns.includes('times')) row.push(orDash(record.checkIn), orDash(record.checkOut));
      if (body.columns.includes('hours')) row.push(orDash(record.hours));
      if (body.columns.includes('camera')) row.push(record.camera, String(record.confidence ?? '—'));
      if (body.columns.includes('leaveBalance')) row.push('14 days');

      lines.push(row.map(escapeCsv).join(','));
    }

    const csv = `${body.type} · ${body.from} to ${body.to}\n${lines.join('\n')}\n`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${body.type.replace(/\s+/g, '-').toLowerCase()}.${body.format}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
