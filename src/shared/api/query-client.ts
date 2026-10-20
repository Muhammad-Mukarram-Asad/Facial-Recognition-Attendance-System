import { QueryClient, isServer } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Long enough that navigating between sidebar routes feels instant,
        // short enough that gate data stays believable.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (isAxiosError(error) && error.response?.status === 401) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  // Server: a fresh client per request so caches are never shared between users.
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
