'use client';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { Button, Card, EmptyState, Skeleton, StatCard } from '@/shared/ui';

import { useEmployeeProfile } from '../hooks/useProfile';
import { AttendanceHeatmap } from './AttendanceHeatmap';
import { ProfileHeader } from './ProfileHeader';
import { RecentPunchesCard } from './RecentPunchesCard';

export function ProfileView({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const { data: profile, isPending, isError } = useEmployeeProfile(employeeId);

  if (isError) {
    return (
      <Card padding={0}>
        <EmptyState
          message="That employee could not be found"
          icon="user-round-x"
          hint="They may have been removed from the roster."
        />
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
          <Button size="sm" icon="arrow-left" onClick={() => router.push(ROUTES.attendance)}>
            Back to records
          </Button>
        </div>
      </Card>
    );
  }

  if (isPending || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Skeleton height={124} radius={14} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} height={110} radius={14} />
          ))}
        </div>
        <Skeleton height={280} radius={14} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ProfileHeader profile={profile} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
        <StatCard label="Attendance rate" value={profile.stats.attendanceRate} />
        <StatCard label="Late arrivals (30d)" value={profile.stats.lateArrivals} valueTone="medium" />
        <StatCard label="Absences (30d)" value={profile.stats.absences} valueTone="high" />
        <StatCard label="Avg. worked hours" value={profile.stats.averageHours} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <AttendanceHeatmap history={profile.history} label={profile.historyLabel} />
        <RecentPunchesCard punches={profile.punches} />
      </div>
    </div>
  );
}
