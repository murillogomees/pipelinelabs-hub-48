import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { PermissionProvider } from '@/components/PermissionProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { SentryErrorBoundary } from '@/components/ErrorBoundary/SentryErrorBoundary';
import { PrivacyConsentProvider } from '@/components/LGPD/PrivacyConsentProvider';
import { TermsProvider } from '@/components/Terms/TermsProvider';
import { SecurityBoundary } from '@/components/Security/SecurityBoundary';
import { AnalyticsProvider } from '@/components/Analytics/AnalyticsProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load components
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Vendas = React.lazy(() => import('@/pages/Vendas'));
const Produtos = React.lazy(() => import('@/pages/Produtos'));
const Clientes = React.lazy(() => import('@/pages/Clientes'));
const Compras = React.lazy(() => import('@/pages/Compras'));
const Financeiro = React.lazy(() => import('@/pages/Financeiro'));
const NotasFiscais = React.lazy(() => import('@/pages/NotasFiscais'));
const Producao = React.lazy(() => import('@/pages/Producao'));
const Relatorios = React.lazy(() => import('@/pages/Relatorios'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const MarketplaceChannels = React.lazy(() => import('@/pages/MarketplaceChannels'));
const Configuracoes = React.lazy(() => import('@/pages/Configuracoes'));
const ConfiguracaoNFe = React.lazy(() => import('@/pages/ConfiguracaoNFe'));
const ConfiguracoesIntegracoes = React.lazy(() => import('@/pages/ConfiguracoesIntegracoes'));
const UserDadosPessoais = React.lazy(() => import('@/pages/UserDadosPessoais'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const AdminUsuarios = React.lazy(() => import('@/pages/AdminUsuarios'));
const AdminIntegracoes = React.lazy(() => import('@/pages/AdminIntegracoes'));
const AdminNotificacoes = React.lazy(() => import('@/pages/AdminNotificacoes'));
const AdminBackup = React.lazy(() => import('@/pages/AdminBackup'));
const AdminCache = React.lazy(() => import('@/pages/AdminCache'));
const AdminCompressao = React.lazy(() => import('@/pages/AdminCompressao'));
const AdminMonitoramento = React.lazy(() => import('@/pages/AdminMonitoramento'));
const AdminVersions = React.lazy(() => import('@/pages/AdminVersions'));
const AdminAuditLogs = React.lazy(() => import('@/pages/AdminAuditLogs'));
const AdminLandingPage = React.lazy(() => import('@/pages/AdminLandingPage'));
const TermosDeUso = React.lazy(() => import('@/pages/TermosDeUso'));
const Privacidade = React.lazy(() => import('@/pages/Privacidade'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SentryErrorBoundary>
          <SecurityBoundary>
            <AuthProvider>
              <PermissionProvider>
                <PrivacyConsentProvider>
                  <TermsProvider>
                    <AnalyticsProvider>
                      <div className="min-h-screen bg-background">
                        <Suspense fallback={
                          <div className="min-h-screen flex items-center justify-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                          </div>
                        }>
                          <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/termos-de-uso" element={<TermosDeUso />} />
                            <Route path="/privacidade" element={<Privacidade />} />

                            {/* Protected app routes */}
                            <Route path="/app/*" element={
                              <ProtectedRoute>
                                <Routes>
                                  <Route path="dashboard" element={<Dashboard />} />
                                  <Route path="vendas" element={<Vendas />} />
                                  <Route path="produtos" element={<Produtos />} />
                                  <Route path="clientes" element={<Clientes />} />
                                  <Route path="compras" element={<Compras />} />
                                  <Route path="financeiro" element={<Financeiro />} />
                                  <Route path="notas-fiscais" element={<NotasFiscais />} />
                                  <Route path="producao" element={<Producao />} />
                                  <Route path="relatorios" element={<Relatorios />} />
                                  <Route path="analytics" element={<Analytics />} />
                                  <Route path="marketplace-channels" element={<MarketplaceChannels />} />
                                  <Route path="configuracoes" element={<Configuracoes />} />
                                  <Route path="configuracoes/nfe" element={<ConfiguracaoNFe />} />
                                  <Route path="configuracoes/integracoes" element={<ConfiguracoesIntegracoes />} />
                                  
                                  {/* User routes */}
                                  <Route path="user/dados-pessoais" element={<UserDadosPessoais />} />

                                  {/* Admin routes */}
                                  <Route path="admin" element={<Admin />} />
                                  <Route path="admin/usuarios" element={<AdminUsuarios />} />
                                  <Route path="admin/integracoes" element={<AdminIntegracoes />} />
                                  <Route path="admin/notificacoes" element={<AdminNotificacoes />} />
                                  <Route path="admin/backup" element={<AdminBackup />} />
                                  <Route path="admin/cache" element={<AdminCache />} />
                                  <Route path="admin/compressao" element={<AdminCompressao />} />
                                  <Route path="admin/monitoramento" element={<AdminMonitoramento />} />
                                  <Route path="admin/versions" element={<AdminVersions />} />
                                  <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
                                  <Route path="admin/landing-page" element={<AdminLandingPage />} />
                                </Routes>
                              </ProtectedRoute>
                            } />

                            {/* 404 catch-all */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </div>
                      <Toaster />
                      <SonnerToaster />
                    </AnalyticsProvider>
                  </TermsProvider>
                </PrivacyConsentProvider>
              </PermissionProvider>
            </AuthProvider>
          </SecurityBoundary>
        </SentryErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
