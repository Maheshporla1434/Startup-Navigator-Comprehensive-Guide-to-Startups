'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Session level hard-refresh to clear browser tab caches when first opened
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasRefreshed = sessionStorage.getItem('has_hard_refreshed');
      if (!hasRefreshed) {
        sessionStorage.setItem('has_hard_refreshed', 'true');
        // Triggers browser hard refresh
        window.location.reload();
      }
    }
  }, []);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 0,
        retry: 1,
      },
    },
  }));

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(AuthProvider, null, children)
  );
}
