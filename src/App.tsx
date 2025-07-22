
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { Auth } from '@/pages/Auth';
import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageSuspenseBoundary } from '@/components/Common/SuspenseBoundary';
import { ComponentPreloader } from '@/utils/preloader';

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
const EmissaoFiscal = React.lazy(() => import('@/pages/EmissaoFiscal').then(module => ({ default: module.EmissaoFiscal })));
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
const IntegracaoERP = React.lazy(() => import('@/pages/IntegracaoERP'));

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

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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
  const { isAuthenticated } = useAuth();
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
    <Routes>
      {/* Auth route */}
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />} 
      />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <PageSuspenseBoundary>
              <Outlet />
            </PageSuspenseBoundary>
          </MainLayout>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/vendas/pedidos" element={<div>Pedidos</div>} />
        <Route path="/vendas/pdv" element={<div>PDV</div>} />
        <Route path="/vendas/propostas" element={<div>Propostas</div>} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/estoque" element={<Estoque />} />
        <Route path="/produtos/categorias" element={<div>Categorias</div>} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/compras/cotacoes" element={<div>Cotações</div>} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/fornecedores" element={<div>Fornecedores</div>} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/financeiro/pagar" element={<div>Contas a Pagar</div>} />
        <Route path="/financeiro/receber" element={<div>Contas a Receber</div>} />
        <Route path="/financeiro/conciliacao" element={<div>Conciliação</div>} />
        <Route path="/notas-fiscais" element={<NotasFiscais />} />
        <Route path="/notas-fiscais/nfe" element={<div>NFe</div>} />
        <Route path="/notas-fiscais/nfce" element={<div>NFCe</div>} />
        <Route path="/notas-fiscais/nfse" element={<div>NFSe</div>} />
        <Route path="/emissao-fiscal" element={<EmissaoFiscal />} />
        <Route path="/producao" element={<Producao />} />
        <Route path="/producao/os" element={<div>Ordens de Serviço</div>} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/integracoes" element={<Integracoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/configuracoes/nfe" element={<ConfiguracaoNFe />} />
        <Route path="/configuracoes/integracoes" element={<ConfiguracoesIntegracoes />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
        <Route path="/admin/planos" element={<ProtectedRoute requireAdmin><AdminPlanos /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin><AdminUsuarios /></ProtectedRoute>} />
        <Route path="/admin/integracoes" element={<ProtectedRoute requireAdmin><AdminIntegracoes /></ProtectedRoute>} />
        <Route path="/admin/notificacoes" element={<ProtectedRoute requireAdmin><AdminNotificacoes /></ProtectedRoute>} />
        <Route path="/admin/backup" element={<ProtectedRoute requireSuperAdmin><AdminBackup /></ProtectedRoute>} />
        <Route path="/admin/integracao-erp" element={<ProtectedRoute requireAdmin><IntegracaoERP /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppRoutes />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
