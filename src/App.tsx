
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/components/Auth/AuthProvider';
import { AnalyticsProvider } from '@/components/Analytics';
import { PrivacyConsentProvider } from '@/components/LGPD/PrivacyConsentProvider';
import { TermsProvider } from '@/components/Terms/TermsProvider';
import { Auth } from '@/pages/Auth';
import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageSuspenseBoundary } from '@/components/Common/SuspenseBoundary';
import { ComponentPreloader } from '@/utils/preloader';
import { initSentry } from '@/lib/sentry';
import { SentryErrorBoundary } from '@/components/ErrorBoundary/SentryErrorBoundary';

// Lazy loading das páginas para melhor performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Vendas = React.lazy(() => import('@/pages/Vendas').then(module => ({ default: module.Vendas })));
const Produtos = React.lazy(() => import('@/pages/Produtos').then(module => ({ default: module.Produtos })));
const Clientes = React.lazy(() => import('@/pages/Clientes').then(module => ({ default: module.Clientes })));
const Compras = React.lazy(() => import('@/pages/Compras'));
const Financeiro = React.lazy(() => import('@/pages/Financeiro'));
const NotasFiscais = React.lazy(() => import('@/pages/NotasFiscais').then(module => ({ default: module.NotasFiscais })));
const Producao = React.lazy(() => import('@/pages/Producao').then(module => ({ default: module.Producao })));
const Relatorios = React.lazy(() => import('@/pages/Relatorios').then(module => ({ default: module.Relatorios })));
const Configuracoes = React.lazy(() => import('@/pages/Configuracoes'));
const Integracoes = React.lazy(() => import('@/pages/Integracoes').then(module => ({ default: module.Integracoes })));
const Estoque = React.lazy(() => import('@/pages/Estoque'));

const ConfiguracaoNFe = React.lazy(() => import('@/pages/ConfiguracaoNFe'));
const ConfiguracoesIntegracoes = React.lazy(() => import('@/pages/ConfiguracoesIntegracoes').then(module => ({ default: module.ConfiguracoesIntegracoes })));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Admin pages - também lazy loaded
const Admin = React.lazy(() => import('@/pages/Admin').then(module => ({ default: module.Admin })));
const AdminPlanos = React.lazy(() => import('@/pages/AdminPlanos').then(module => ({ default: module.AdminPlanos })));
const AdminUsuarios = React.lazy(() => import('@/pages/AdminUsuarios'));
const AdminIntegracoes = React.lazy(() => import('@/pages/AdminIntegracoes').then(module => ({ default: module.AdminIntegracoes })));
const AdminNotificacoes = React.lazy(() => import('@/pages/AdminNotificacoes').then(module => ({ default: module.AdminNotificacoes })));
const AdminBackup = React.lazy(() => import('@/pages/AdminBackup'));
const AdminAuditLogs = React.lazy(() => import('@/pages/AdminAuditLogs'));
const AdminCache = React.lazy(() => import('@/pages/AdminCache').then(module => ({ default: module.AdminCache })));
const AdminLandingPage = React.lazy(() => import('@/pages/AdminLandingPage').then(module => ({ default: module.AdminLandingPage })));
const AdminCompressao = React.lazy(() => import('@/pages/AdminCompressao').then(module => ({ default: module.AdminCompressao })));
const AdminMonitoramento = React.lazy(() => import('@/pages/AdminMonitoramento'));
const AdminStripe = React.lazy(() => import('@/pages/AdminStripe'));
const AdminNFeConfig = React.lazy(() => import('@/pages/AdminNFeConfig'));
const AdminVersions = React.lazy(() => import('@/pages/AdminVersions'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));

// LGPD pages
const Privacidade = React.lazy(() => import('@/pages/Privacidade'));

// Terms pages  
const TermosDeUso = React.lazy(() => import('@/pages/TermosDeUso'));

// SLA page
const SLA = React.lazy(() => import('@/pages/SLA'));

// Landing Page
const LandingPage = React.lazy(() => import('@/pages/LandingPage').then(module => ({ default: module.LandingPage })));

// Loading components para diferentes tamanhos
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const SmallLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Não tentar novamente para erros de autenticação
        if (error?.message?.includes('JWT')) return false;
        return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    },
  },
});

// Initialize Sentry
initSentry();

function AppRoutes() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <RouteHandler />
    </Router>
  );
}

function RouteHandler() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();

  // Preload de componentes baseado na rota atual
  useEffect(() => {
    if (isAuthenticated && location.pathname) {
      ComponentPreloader.preloadByRoute(location.pathname);
    }
  }, [isAuthenticated, location.pathname]);

  // Preload de componentes críticos na inicialização
  useEffect(() => {
    if (isAuthenticated) {
      ComponentPreloader.preloadCriticalComponents();
    }
  }, [isAuthenticated]);

  return (
    <AnalyticsProvider>
      <PrivacyConsentProvider>
        <TermsProvider>
          <Routes>
      {/* Landing page - accessible for everyone */}
      <Route 
        path="/" 
        element={
          <PageSuspenseBoundary>
            <LandingPage />
          </PageSuspenseBoundary>
        } 
      />
      
      {/* Auth route - only for non-authenticated users */}
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Auth />} 
      />
      
      {/* Protected routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <MainLayout>
            <PageSuspenseBoundary>
              <Outlet />
            </PageSuspenseBoundary>
          </MainLayout>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="produtos/estoque" element={<Estoque />} />
        <Route path="compras" element={<Compras />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="notas-fiscais/*" element={<NotasFiscais />} />
        <Route path="producao" element={<Producao />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="integracoes" element={<Integracoes />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="configuracoes/nfe" element={<ConfiguracaoNFe />} />
        <Route path="configuracoes/integracoes" element={<ConfiguracoesIntegracoes />} />
        <Route path="integracoes/marketplaces" element={<Suspense fallback={<PageLoader />}>{React.createElement(React.lazy(() => import('@/pages/MarketplaceIntegrations')))}</Suspense>} />
        
        {/* Admin routes */}
        <Route path="admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
        <Route path="admin/planos" element={<ProtectedRoute requireAdmin><AdminPlanos /></ProtectedRoute>} />
        <Route path="admin/usuarios" element={<ProtectedRoute requireAdmin><AdminUsuarios /></ProtectedRoute>} />
        <Route path="admin/integracoes" element={<ProtectedRoute requireAdmin><AdminIntegracoes /></ProtectedRoute>} />
        <Route path="admin/notificacoes" element={<ProtectedRoute requireAdmin><AdminNotificacoes /></ProtectedRoute>} />
        <Route path="admin/backup" element={<ProtectedRoute requireSuperAdmin><AdminBackup /></ProtectedRoute>} />
        <Route path="admin/cache" element={<ProtectedRoute requireSuperAdmin><AdminCache /></ProtectedRoute>} />
        <Route path="admin/audit-logs" element={<ProtectedRoute requireAdmin><AdminAuditLogs /></ProtectedRoute>} />
        <Route path="admin/landing-page" element={<ProtectedRoute requireSuperAdmin><AdminLandingPage /></ProtectedRoute>} />
        <Route path="admin/compressao" element={<ProtectedRoute requireSuperAdmin><AdminCompressao /></ProtectedRoute>} />
        <Route path="admin/monitoramento" element={<ProtectedRoute requireSuperAdmin><AdminMonitoramento /></ProtectedRoute>} />
        <Route path="admin/stripe" element={<ProtectedRoute requireSuperAdmin><AdminStripe /></ProtectedRoute>} />
        <Route path="admin/nfe-config" element={<ProtectedRoute requireSuperAdmin><AdminNFeConfig /></ProtectedRoute>} />
        <Route path="admin/versions" element={<ProtectedRoute requireSuperAdmin><AdminVersions /></ProtectedRoute>} />
        <Route path="analytics" element={<Analytics />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
      
      {/* Public LGPD routes */}
      <Route 
        path="/privacidade" 
        element={
          <PageSuspenseBoundary>
            <Privacidade />
          </PageSuspenseBoundary>
        } 
      />
      
      {/* Public Terms routes */}
      <Route 
        path="/termos-de-uso" 
        element={
          <PageSuspenseBoundary>
            <TermosDeUso />
          </PageSuspenseBoundary>
        } 
      />
      
      {/* Public SLA route */}
      <Route 
        path="/sla" 
        element={
          <PageSuspenseBoundary>
            <SLA />
          </PageSuspenseBoundary>
        } 
      />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
        </TermsProvider>
      </PrivacyConsentProvider>
    </AnalyticsProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SentryErrorBoundary>
          <ErrorBoundary>
            <AppRoutes />
            <Toaster />
          </ErrorBoundary>
        </SentryErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
