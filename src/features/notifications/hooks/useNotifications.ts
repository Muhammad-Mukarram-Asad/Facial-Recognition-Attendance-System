'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';

import { notificationsApi } from '../api/notifications.api';
import type { NotificationList } from '../types';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: notificationsApi.list,
    // The bell badge should feel live without hammering the gate service.
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: (data: NotificationList) => {
      queryClient.setQueryData(queryKeys.notifications.list(), data);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: (data: NotificationList) => {
      queryClient.setQueryData(queryKeys.notifications.list(), data);
    },
  });
}
