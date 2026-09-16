import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string(),
  kind: z.enum(['leave', 'alert', 'hr', 'reminder', 'enroll']),
  title: z.string(),
  body: z.string(),
  time: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  read: z.boolean(),
});

export const notificationListSchema = z.object({
  items: z.array(notificationSchema),
  unreadCount: z.number(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationList = z.infer<typeof notificationListSchema>;
