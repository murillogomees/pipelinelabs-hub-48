
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { PermissionProvider } from '@/components/PermissionProvider';
import { AnalyticsProvider } from '@/components/Analytics/AnalyticsProvider';
import { PrivacyConsentProvider } from '@/components/LGPD/PrivacyConsentProvider';
import { TermsProvider } from '@/components/Terms/TermsProvider';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SentryErrorBoundary } from '@/components/ErrorBoundary/SentryErrorBoundary';

// Lazy load pages
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
const ConfiguracaoNFe = React.lazy(() => import('@/pages/ConfiguracaoNFe'));
const Notificacoes = React.lazy(() => import('@/pages/Notificacoes'));
const UserDadosPessoais = React.lazy(() => import('@/pages/UserDadosPessoais'));

// Admin pages
const Admin = React.lazy(() => import('@/pages/Admin'));
const AdminUsuarios = React.lazy(() => import('@/pages/AdminUsuarios'));
const AdminNiveisAcesso = React.lazy(() => import('@/pages/AdminNiveisAcesso'));
const AdminCache = React.lazy(() => import('@/pages/AdminCache'));
const AdminSeguranca = React.lazy(() => import('@/pages/AdminSeguranca'));

const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <SentryErrorBoundary>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider>
              <Router>
                <AuthProvider>
                  <PermissionProvider>
                    <AnalyticsProvider>
                      <PrivacyConsentProvider>
                        <TermsProvider>
                          <Routes>
                            {/* Public routes */}
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
                                      <Route index element={<Dashboard />} />
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
                                      <Route path="configuracao-nfe" element={<ConfiguracaoNFe />} />
                                      <Route path="notificacoes" element={<Notificacoes />} />
                                      <Route path="user/dados-pessoais" element={<UserDadosPessoais />} />
                                      
                                      {/* Admin routes */}
                                      <Route path="admin" element={
                                        <ProtectedRoute requireAdmin>
                                          <Admin />
                                        </ProtectedRoute>
                                      } />
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
                                      <Route path="admin/cache" element={
                                        <ProtectedRoute requireSuperAdmin>
                                          <AdminCache />
                                        </ProtectedRoute>
                                      } />
                                      <Route path="admin/seguranca" element={
                                        <ProtectedRoute requireSuperAdmin>
                                          <AdminSeguranca />
                                        </ProtectedRoute>
                                      } />
                                    </Routes>
                                  </React.Suspense>
                                </MainLayout>
                              </ProtectedRoute>
                            } />

                            {/* Root redirect */}
                            <Route path="/" element={<Navigate to="/app" replace />} />
                            
                            {/* 404 page */}
                            <Route path="*" element={
                              <React.Suspense fallback={<div>Carregando...</div>}>
                                <NotFound />
                              </React.Suspense>
                            } />
                          </Routes>
                        </TermsProvider>
                      </PrivacyConsentProvider>
                    </AnalyticsProvider>
                  </PermissionProvider>
                </AuthProvider>
              </Router>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SentryErrorBoundary>
  );
}

export default App;
