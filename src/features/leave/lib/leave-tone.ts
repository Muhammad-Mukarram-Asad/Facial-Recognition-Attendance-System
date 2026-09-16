import type { Tone } from '@/shared/types';

import type { LeaveRequest } from '../types';

/** Leave type drives the badge colour, matching the design's queue. */
export const LEAVE_TYPE_TONE: Record<LeaveRequest['type'], Tone> = {
  Casual: 'brand',
  Medical: 'high',
  Annual: 'medium',
  Special: 'warning',
};
