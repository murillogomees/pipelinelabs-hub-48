import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { AnalyticsProvider } from '@/components/Analytics/AnalyticsProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { NetworkStatusIndicator } from '@/components/Network/NetworkStatusIndicator';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PrivateRoute } from '@/components/Auth/PrivateRoute';
import { Suspense, lazy } from 'react';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Auth = lazy(() => import('@/pages/Auth'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const MarketplaceChannels = lazy(() => import('@/pages/MarketplaceChannels'));
const Configuracoes = lazy(() => import('@/pages/Configuracoes'));
const AdminUsuarios = lazy(() => import('@/pages/AdminUsuarios'));
const UserDadosPessoais = lazy(() => import('@/pages/UserDadosPessoais'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Produtos = lazy(() => import('@/pages/Produtos'));
const Clientes = lazy(() => import('@/pages/Clientes'));
const Vendas = lazy(() => import('@/pages/Vendas'));
const Financeiro = lazy(() => import('@/pages/Financeiro'));
const NotasFiscais = lazy(() => import('@/pages/NotasFiscais'));
const Producao = lazy(() => import('@/pages/Producao'));
const Integracoes = lazy(() => import('@/pages/Integracoes'));
const Compras = lazy(() => import('@/pages/Compras'));
const Estoque = lazy(() => import('@/pages/Estoque'));
const Relatorios = lazy(() => import('@/pages/Relatorios'));
const Analytics = lazy(() => import('@/pages/Analytics'));

// Admin Pages
const Admin = lazy(() => import('@/pages/Admin'));
const AdminNiveisAcesso = lazy(() => import('@/pages/AdminNiveisAcesso'));
const AdminBackup = lazy(() => import('@/pages/AdminBackup'));
const AdminSeguranca = lazy(() => import('@/pages/AdminSeguranca'));
const AdminCompressao = lazy(() => import('@/pages/AdminCompressao'));
const AdminLandingPage = lazy(() => import('@/pages/AdminLandingPage'));
const AdminPromptGenerator = lazy(() => import('@/pages/AdminPromptGenerator'));
const AdminVersions = lazy(() => import('@/pages/AdminVersions'));
const AdminNotifications = lazy(() => import('@/pages/AdminNotifications'));
const AdminIntegrations = lazy(() => import('@/pages/AdminIntegrations'));
const AdminCache = lazy(() => import('@/pages/AdminCache'));
const AdminMonitoring = lazy(() => import('@/pages/AdminMonitoring'));
const AdminSLA = lazy(() => import('@/pages/AdminSLA'));

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <AnalyticsProvider>
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
                    
                    {/* Protected Routes with Sidebar Layout */}
                    <Route path="/app" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Dashboard />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/vendas" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Vendas />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/produtos" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Produtos />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/clientes" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Clientes />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/compras" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Compras />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/estoque" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Estoque />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/financeiro" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Financeiro />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/notas-fiscais" element={
                      <PrivateRoute>
                        <MainLayout>
                          <NotasFiscais />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/producao" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Producao />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/relatorios" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Relatorios />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/analytics" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Analytics />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/marketplace-channels" element={
                      <PrivateRoute>
                        <MainLayout>
                          <MarketplaceChannels />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/integracoes" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Integracoes />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/configuracoes" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Configuracoes />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/app/admin" element={
                      <PrivateRoute>
                        <MainLayout>
                          <Admin />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/usuarios" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminUsuarios />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/niveis-acesso" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminNiveisAcesso />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/backup" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminBackup />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/seguranca" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminSeguranca />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/compressao" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminCompressao />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/landing-page" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminLandingPage />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/prompt-generator" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminPromptGenerator />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/versions" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminVersions />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/notificacoes" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminNotifications />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/integracoes" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminIntegrations />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/cache" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminCache />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/monitoramento" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminMonitoring />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/admin/sla" element={
                      <PrivateRoute>
                        <MainLayout>
                          <AdminSLA />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="/app/users/:id" element={
                      <PrivateRoute>
                        <MainLayout>
                          <UserDadosPessoais />
                        </MainLayout>
                      </PrivateRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                
                <Toaster />
              </div>
            </AnalyticsProvider>
          </Router>
        </AuthProvider>
        
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
