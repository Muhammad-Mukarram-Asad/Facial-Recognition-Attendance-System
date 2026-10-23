'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { CSSProperties, ReactNode } from 'react';
import { Toaster } from 'sonner';

import { getQueryClient } from '@/shared/api/query-client';
import { StoreProvider } from '@/shared/store/StoreProvider';
import { ThemeProvider, useTheme } from '@/shared/theme/ThemeProvider';

/** Clears the console top bar so a toast sits in the upper-right of the page. */
const TOAST_OFFSET = { top: 88, right: 20 } as const;

function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      expand
      gap={12}
      offset={TOAST_OFFSET}
      mobileOffset={{ top: 16, right: 16, left: 16 }}
      style={{ '--width': '480px' } as CSSProperties}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
        },
      }}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
