/** GET /api/v1/designations/full — same shape as departments. */
export interface Designation {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
