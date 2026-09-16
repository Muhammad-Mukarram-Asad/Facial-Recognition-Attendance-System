'use client';

import { Avatar, Badge, Button, Card, CardHeader, EmptyState, SegmentedControl, SkeletonRows } from '@/shared/ui';

import { useDecideLeave, useLeaveRequests } from '../hooks/useLeave';
import { LEAVE_TYPE_TONE } from '../lib/leave-tone';
import { LEAVE_FILTERS, type LeaveFilter } from '../types';

export interface LeaveQueueProps {
  filter: LeaveFilter;
  onFilterChange: (filter: LeaveFilter) => void;
}

export function LeaveQueue({ filter, onFilterChange }: LeaveQueueProps) {
  const { data, isPending } = useLeaveRequests({ filter });
  const decide = useDecideLeave();

  return (
    <Card padding="18px 20px" style={{ gap: 8 }}>
      <CardHeader
        title="Approval queue"
        meta={
          <SegmentedControl
            size="sm"
            ariaLabel="Leave status filter"
            options={[...LEAVE_FILTERS]}
            value={filter}
            onChange={(value) => onFilterChange(value as LeaveFilter)}
          />
        }
      />

      {isPending ? (
        <SkeletonRows rows={5} height={52} />
      ) : data && data.items.length === 0 ? (
        <EmptyState message="Nothing waiting in this view" icon="calendar-check" hint="The queue is clear." />
      ) : (
        data?.items.map((request) => {
          const pending = request.status === 'Pending';
          const deciding = decide.isPending && decide.variables?.id === request.id;
          return (
            <div
              key={request.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                padding: '14px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Avatar name={request.name} size={40} />

              <div style={{ flex: '1 1 160px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-strong)' }}>{request.name}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{request.reason}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '0 1 150px', minWidth: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-strong)' }}>
                  {request.dates}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{request.days}</span>
              </div>

              <Badge tone={LEAVE_TYPE_TONE[request.type]}>{request.type}</Badge>

              {pending ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button
                    size="sm"
                    icon="check"
                    loading={deciding && decide.variables?.status === 'Approved'}
                    onClick={() => decide.mutate({ id: request.id, status: 'Approved' })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="x"
                    loading={deciding && decide.variables?.status === 'Rejected'}
                    onClick={() => decide.mutate({ id: request.id, status: 'Rejected' })}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <Badge tone={request.status === 'Approved' ? 'success' : 'high'} dot>
                  {request.status}
                </Badge>
              )}
            </div>
          );
        })
      )}
    </Card>
  );
}
