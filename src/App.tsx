
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { AnalyticsProvider } from '@/components/Analytics/AnalyticsProvider';
import { SentryErrorBoundary } from '@/components/ErrorBoundary/SentryErrorBoundary';
import { NetworkStatusIndicator } from '@/components/Network/NetworkStatusIndicator';
import { Suspense, lazy } from 'react';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Auth = lazy(() => import('@/pages/Auth'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const MarketplaceChannels = lazy(() => import('@/pages/MarketplaceChannels'));
const Configuracoes = lazy(() => import('@/pages/Configuracoes'));
const AdminUsuarios = lazy(() => import('@/pages/AdminUsuarios'));
const UserDadosPessoais = lazy(() => import('@/pages/UserDadosPessoais'));
const Plans = lazy(() => import('@/pages/Plans'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Produtos = lazy(() => import('@/pages/Produtos'));
const Clientes = lazy(() => import('@/pages/Clientes'));
const Vendas = lazy(() => import('@/pages/Vendas'));
const Financeiro = lazy(() => import('@/pages/Financeiro'));
const NotasFiscais = lazy(() => import('@/pages/NotasFiscais'));
const Producao = lazy(() => import('@/pages/Producao'));
const Contracts = lazy(() => import('@/pages/Contracts'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Project = lazy(() => import('@/pages/Project'));
const Projects = lazy(() => import('@/pages/Projects'));
const Workspace = lazy(() => import('@/pages/Workspace'));
const Workspaces = lazy(() => import('@/pages/Workspaces'));
const Integracoes = lazy(() => import('@/pages/Integracoes'));
const ApiBrowser = lazy(() => import('@/pages/ApiBrowser'));

// Create a stable query client with network error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        
        // Retry network errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Reduce unnecessary requests
      refetchOnReconnect: true, // Refetch when reconnecting
    },
    mutations: {
      retry: 1, // Retry mutations once on network errors
    },
  },
});

function App() {
  return (
    <SentryErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AnalyticsProvider>
            <Router>
              <div className="App">
                <NetworkStatusIndicator />
                
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/planos" element={<Plans />} />
                    <Route path="/app" element={<Dashboard />} />
                    <Route path="/app/marketplace-channels" element={<MarketplaceChannels />} />
                    <Route path="/app/settings" element={<Configuracoes />} />
                    <Route path="/app/users" element={<AdminUsuarios />} />
                    <Route path="/app/users/:id" element={<UserDadosPessoais />} />
                    <Route path="/app/products" element={<Produtos />} />
                    <Route path="/app/customers" element={<Clientes />} />
                    <Route path="/app/sales" element={<Vendas />} />
                    <Route path="/app/finances" element={<Financeiro />} />
                    <Route path="/app/invoices" element={<NotasFiscais />} />
                    <Route path="/app/production" element={<Producao />} />
                    <Route path="/app/contracts" element={<Contracts />} />
                    <Route path="/app/tasks" element={<Tasks />} />
                    <Route path="/app/projects/:id" element={<Project />} />
                    <Route path="/app/projects" element={<Projects />} />
                    <Route path="/app/workspaces/:id" element={<Workspace />} />
                    <Route path="/app/workspaces" element={<Workspaces />} />
                    <Route path="/app/integrations" element={<Integracoes />} />
                    <Route path="/app/api-browser" element={<ApiBrowser />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                
                <Toaster />
              </div>
            </Router>
          </AnalyticsProvider>
        </AuthProvider>
        
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SentryErrorBoundary>
  );
}

export default App;
