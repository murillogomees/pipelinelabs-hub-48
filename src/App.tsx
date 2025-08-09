
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserRoutes } from "@/routes/UserRoutes";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import Auth from "@/pages/Auth";
import { AuthCallback } from "@/components/AuthCallback";
import { useServiceHealth } from '@/hooks/useServiceHealth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount: number, error: any) => {
        const msg = String(error?.message || '');
        const status = (error as any)?.status;
        if (status === 503 || msg.includes('PGRST002') || msg.includes('schema "net" does not exist')) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: (failureCount: number, error: any) => {
        const msg = String(error?.message || '');
        const status = (error as any)?.status;
        if (status === 503 || msg.includes('PGRST002') || msg.includes('schema "net" does not exist')) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

function App() {
  const [serviceDown, setServiceDown] = useState(false);
  const { isHealthy } = useServiceHealth();
  const handleRetry = () => {
    queryClient.invalidateQueries();
  };
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event: any) => {
      const q = event?.query;
      if (event?.type === 'updated' && q?.state?.status === 'error') {
        const err: any = q.state.error;
        const msg = String(err?.message || '');
        const status = err?.status;
        if (status === 503 || msg.includes('PGRST002') || msg.includes('schema "net" does not exist')) {
          setServiceDown(true);
        }
      }
    });
    const handleOnline = () => setServiceDown(false);
    window.addEventListener('online', handleOnline);
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  useEffect(() => {
    if (isHealthy) {
      setServiceDown(false);
      queryClient.invalidateQueries();
    } else {
      setServiceDown(true);
    }
  }, [isHealthy]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {serviceDown && (
            <div className="w-full border-b bg-destructive/10 text-destructive">
              <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-between">
                <p className="text-sm">
                  Modo degradado: banco de dados indisponível (PGRST002). Tentaremos novamente automaticamente.
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center rounded-md border border-destructive/30 px-3 py-1 text-sm hover:bg-destructive/10 transition"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/app/*" element={<UserRoutes />} />
                <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
