import { getValidated } from '@/shared/api/client';

import { profileSchema, type EmployeeProfile } from '../types';

export const profileApi = {
  detail: (employeeId: string): Promise<EmployeeProfile> =>
    getValidated(`/profile/${employeeId}`, profileSchema),
};
