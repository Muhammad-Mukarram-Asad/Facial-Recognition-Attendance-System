// GET /api/v1/shifts/full

export interface ShiftType {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_overnight: boolean;
    grace_period_minutes: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }