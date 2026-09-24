'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { getQueryClient } from '@/shared/api/query-client';
import { StoreProvider } from '@/shared/store/StoreProvider';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </StoreProvider>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: 'var(--surface-card)',
            color: 'var(--text-strong)',
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13.5,
          },
        }}
      />
    </QueryClientProvider>
  );
}
