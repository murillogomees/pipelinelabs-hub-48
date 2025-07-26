
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PermissionProvider } from '@/components/PermissionProvider';
import { AnalyticsProvider } from '@/components/Analytics/AnalyticsProvider';
import { PrivacyConsentProvider } from '@/components/LGPD/PrivacyConsentProvider';
import { TermsProvider } from '@/components/Terms/TermsProvider';
import { Toaster } from '@/components/ui/sonner';
import { SentryErrorBoundary } from '@/components/ErrorBoundary/SentryErrorBoundary';

// Lazy load pages
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Vendas = React.lazy(() => import('@/pages/Vendas'));
const Produtos = React.lazy(() => import('@/pages/Produtos'));
const Clientes = React.lazy(() => import('@/pages/Clientes'));
const Compras = React.lazy(() => import('@/pages/Compras'));
const Estoque = React.lazy(() => import('@/pages/Estoque'));
const Financeiro = React.lazy(() => import('@/pages/Financeiro'));
const NotasFiscais = React.lazy(() => import('@/pages/NotasFiscais'));
const Producao = React.lazy(() => import('@/pages/Producao'));
const Relatorios = React.lazy(() => import('@/pages/Relatorios'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const MarketplaceChannels = React.lazy(() => import('@/pages/MarketplaceChannels'));
const Integracoes = React.lazy(() => import('@/pages/Integracoes'));
const Configuracoes = React.lazy(() => import('@/pages/Configuracoes'));

// Admin pages
const Admin = React.lazy(() => import('@/pages/Admin'));
const AdminUsuarios = React.lazy(() => import('@/pages/AdminUsuarios'));
const AdminNiveisAcesso = React.lazy(() => import('@/pages/AdminNiveisAcesso'));
const AdminIntegracoes = React.lazy(() => import('@/pages/AdminIntegracoes'));
const AdminNotificacoes = React.lazy(() => import('@/pages/AdminNotificacoes'));
const AdminBackup = React.lazy(() => import('@/pages/AdminBackup'));
const AdminCache = React.lazy(() => import('@/pages/AdminCache'));
const AdminCompressao = React.lazy(() => import('@/pages/AdminCompressao'));
const AdminMonitoramento = React.lazy(() => import('@/pages/AdminMonitoramento'));
const AdminVersions = React.lazy(() => import('@/pages/AdminVersions'));
const AdminLandingPage = React.lazy(() => import('@/pages/AdminLandingPage'));
const AdminSeguranca = React.lazy(() => import('@/pages/AdminSeguranca'));
const AdminSLA = React.lazy(() => import('@/pages/AdminSLA'));
const AdminPromptGenerator = React.lazy(() => import('@/pages/AdminPromptGenerator'));
const AdminSegurancaConfig = React.lazy(() => import('@/pages/AdminSegurancaConfig'));
const AdminAuditLogs = React.lazy(() => import('@/pages/AdminAuditLogs'));
const AdminNFeConfig = React.lazy(() => import('@/pages/AdminNFeConfig'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <SentryErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <BrowserRouter>
                <AuthProvider>
                  <PermissionProvider>
                    <AnalyticsProvider>
                      <PrivacyConsentProvider>
                        <TermsProvider>
                          <Routes>
                            {/* Public landing page */}
                            <Route 
                              path="/" 
                              element={
                                <React.Suspense fallback={<div>Carregando...</div>}>
                                  <LandingPage />
                                </React.Suspense>
                              } 
                            />

                            {/* Auth route */}
                            <Route 
                              path="/auth" 
                              element={
                                <React.Suspense fallback={<div>Carregando...</div>}>
                                  <Auth />
                                </React.Suspense>
                              } 
                            />

                            {/* Protected app routes */}
                            <Route path="/app/*" element={
                              <ProtectedRoute>
                                <MainLayout>
                                  <React.Suspense fallback={<div>Carregando...</div>}>
                                    <Routes>
                                      <Route path="dashboard" element={<Dashboard />} />
                                      <Route path="vendas" element={<Vendas />} />
                                      <Route path="produtos" element={<Produtos />} />
                                      <Route path="clientes" element={<Clientes />} />
                                      <Route path="compras" element={<Compras />} />
                                      <Route path="estoque" element={<Estoque />} />
                                      <Route path="financeiro" element={<Financeiro />} />
                                      <Route path="notas-fiscais" element={<NotasFiscais />} />
                                      <Route path="producao" element={<Producao />} />
                                      <Route path="relatorios" element={<Relatorios />} />
                                      <Route path="analytics" element={<Analytics />} />
                                      <Route path="marketplace-channels" element={<MarketplaceChannels />} />
                                      <Route path="integracoes" element={<Integracoes />} />
                                      <Route path="configuracoes" element={<Configuracoes />} />
                                      
                                      {/* Admin routes */}
                                      <Route path="admin" element={<Admin />} />
                                      <Route path="admin/usuarios" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminUsuarios />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/niveis-acesso" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminNiveisAcesso />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/integracoes" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminIntegracoes />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/notificacoes" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminNotificacoes />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/backup" element={
                                        <ProtectedRoute requireSuperAdmin>
                                          <AdminBackup />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/cache" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminCache />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/compressao" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminCompressao />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/monitoramento" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminMonitoramento />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/versions" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminVersions />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/landing-page" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminLandingPage />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/seguranca" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminSeguranca />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/seguranca-config" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminSegurancaConfig />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/sla" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminSLA />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/prompt-generator" element={
                                        <ProtectedRoute requireSuperAdmin>
                                          <AdminPromptGenerator />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/audit-logs" element={
                                        <ProtectedRoute requireAdmin>
                                          <AdminAuditLogs />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/nfe-config" element={
                                        <ProtectedRoute requireSuperAdmin>
                                          <AdminNFeConfig />
                                        </ProtectedRoute>
                                      } />

                                      {/* Redirect /app to /app/dashboard */}
                                      <Route index element={<Navigate to="dashboard" replace />} />
                                    </Routes>
                                  </React.Suspense>
                                </MainLayout>
                              </ProtectedRoute>
                            } />
                            
                            {/* 404 page */}
                            <Route path="*" element={
                              <div className="flex items-center justify-center min-h-screen">
                                <div className="text-center">
                                  <h1 className="text-2xl font-bold mb-4">Página não encontrada</h1>
                                  <p className="text-muted-foreground mb-4">A página que você está procurando não existe.</p>
                                  <Navigate to="/app" replace />
                                </div>
                              </div>
                            } />
                          </Routes>
                          <Toaster />
                        </TermsProvider>
                      </PrivacyConsentProvider>
                    </AnalyticsProvider>
                  </PermissionProvider>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SentryErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;
