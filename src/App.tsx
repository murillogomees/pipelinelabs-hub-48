
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { PermissionProvider } from '@/components/PermissionProvider';
import { Toaster } from '@/components/ui/sonner';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import SLA from '@/pages/SLA';
import Privacidade from '@/pages/Privacidade';
import TermosDeUso from '@/pages/TermosDeUso';
import NotFound from '@/pages/NotFound';

// Route Components
import { AppRoutes } from '@/routes/AppRoutes';
import { AdminRoutes } from '@/routes/AdminRoutes';
import { UserRoutes } from '@/routes/UserRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PermissionProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sla" element={<SLA />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<TermosDeUso />} />

              {/* Protected App Routes */}
              <AppRoutes />
              
              {/* User Routes */}
              <UserRoutes />

              {/* Admin Routes */}
              <AdminRoutes />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </PermissionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
