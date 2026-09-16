import { getValidated, patchValidated } from '@/shared/api/client';

import { notificationListSchema, type NotificationList } from '../types';

export const notificationsApi = {
  list: (): Promise<NotificationList> =>
    getValidated('/notifications', notificationListSchema),

  markRead: (id: string): Promise<NotificationList> =>
    patchValidated(`/notifications/${id}`, notificationListSchema, { read: true }),

  markAllRead: (): Promise<NotificationList> =>
    patchValidated('/notifications', notificationListSchema, { read: true }),
};
