'use client';

import { Button, Card, Checkbox, SelectField, TextField } from '@/shared/ui';

import { useExportReport } from '../hooks/useReports';
import { REPORT_COLUMNS, REPORT_DEPARTMENTS, REPORT_TYPES, type ReportQuery } from '../types';

export interface ReportBuilderProps {
  query: ReportQuery;
  onQueryChange: (patch: Partial<ReportQuery>) => void;
  columns: Set<string>;
  onToggleColumn: (id: string) => void;
}

export function ReportBuilder({ query, onQueryChange, columns, onToggleColumn }: ReportBuilderProps) {
  const exportReport = useExportReport();

  const run = (format: 'xlsx' | 'pdf') =>
    exportReport.mutate({ ...query, format, columns: Array.from(columns) });

  return (
    <Card padding={22} style={{ flex: '1 1 300px', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-strong)' }}>Build a report</h3>

      <SelectField
        label="Report type"
        options={REPORT_TYPES}
        value={query.type}
        onChange={(event) => onQueryChange({ type: event.target.value })}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
        <TextField
          label="From"
          mono
          placeholder="01 / 09 / 2026"
          value={query.from}
          onChange={(event) => onQueryChange({ from: event.target.value })}
        />
        <TextField
          label="To"
          mono
          placeholder="09 / 09 / 2026"
          value={query.to}
          onChange={(event) => onQueryChange({ to: event.target.value })}
        />
      </div>

      <SelectField
        label="Department"
        options={REPORT_DEPARTMENTS}
        value={query.department}
        onChange={(event) => onQueryChange({ department: event.target.value })}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          Include columns
        </span>
        {REPORT_COLUMNS.map((column) => (
          <Checkbox
            key={column.id}
            checked={columns.has(column.id)}
            onChange={() => onToggleColumn(column.id)}
          >
            {column.label}
          </Checkbox>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <Button
          icon="file-down"
          onClick={() => run('xlsx')}
          loading={exportReport.isPending && exportReport.variables?.format === 'xlsx'}
        >
          Export XLSX
        </Button>
        <Button
          variant="secondary"
          icon="printer"
          onClick={() => run('pdf')}
          loading={exportReport.isPending && exportReport.variables?.format === 'pdf'}
        >
          PDF
        </Button>
      </div>
    </Card>
  );
}
