
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { ExternalResourceManager } from '@/components/ui/external-resource-manager'
import { MandatoryCookieProvider } from '@/components/LGPD/MandatoryCookieProvider'
import { LandingRoutes } from '@/routes/LandingRoutes'
import { UserRoutes } from '@/routes/UserRoutes'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthCallback } from '@/components/AuthCallback'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          // Don't retry 4xx errors
          if ((error as any).status >= 400 && (error as any).status < 500) {
            return false;
          }
        }
        return failureCount < 2; // Reduced retries for faster loading
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Faster retry delays
    },
  },
});

function AppContent() {
  return (
    <ErrorBoundary>
      <MandatoryCookieProvider>
        <ExternalResourceManager enableFonts={true} enableAnalytics={false}>
          <ThemeProvider defaultTheme="light" storageKey="pipeline-ui-theme">
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <Router>
                  <Routes>
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/app/*" element={<UserRoutes />} />
                    <Route path="/*" element={<LandingRoutes />} />
                    <Route path="/" element={<Navigate to="/landing" replace />} />
                  </Routes>
                </Router>
              </AuthProvider>
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </QueryClientProvider>
          </ThemeProvider>
        </ExternalResourceManager>
      </MandatoryCookieProvider>
      <Toaster />
    </ErrorBoundary>
  );
}

function App() {
  return <AppContent />;
}

export default App
