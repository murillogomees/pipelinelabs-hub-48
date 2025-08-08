
import React from 'react';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
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
