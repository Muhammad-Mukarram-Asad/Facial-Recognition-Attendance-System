import type { Metadata } from 'next';

import { AttendanceView } from '@/features/attendance/components/AttendanceView';

export const metadata: Metadata = { title: 'Attendance records — FaceTrack' };

export default function AttendanceRecordsPage() {
  return <AttendanceView />;
}
