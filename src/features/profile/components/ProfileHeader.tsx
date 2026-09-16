'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { toneForStatus } from '@/shared/lib/status';
import { Avatar, Badge, Button, Card } from '@/shared/ui';

import type { EmployeeProfile } from '../types';

export function ProfileHeader({ profile }: { profile: EmployeeProfile }) {
  const router = useRouter();

  return (
    <Card padding={22} style={{ flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <Avatar name={profile.name} size={80} radius={22} />

      <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{profile.name}</h2>
          <Badge tone={toneForStatus(profile.status)} dot>
            {profile.status}
          </Badge>
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {profile.designation} · {profile.department}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)' }}>
          {profile.employeeId} · {profile.gateCamera}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="secondary" size="sm" icon="pencil" onClick={() => router.push(ROUTES.employees)}>
          Edit details
        </Button>
        <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => router.push(ROUTES.attendance)}>
          Back
        </Button>
      </div>
    </Card>
  );
}
