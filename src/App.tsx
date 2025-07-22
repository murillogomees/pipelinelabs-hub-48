
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Auth } from '@/pages/Auth';
import { Admin } from '@/pages/Admin';
import { AdminPlanos } from '@/pages/AdminPlanos';
import { AdminUsuarios } from '@/pages/AdminUsuarios';
import { AdminIntegracoes } from '@/pages/AdminIntegracoes';
import { AdminNotificacoes } from '@/pages/AdminNotificacoes';
import { IntegracaoERP } from '@/pages/IntegracaoERP';
import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminBackup = React.lazy(() => import('./pages/AdminBackup'));

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

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
                <Outlet />
              </MainLayout>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/vendas" element={<div>Vendas</div>} />
            <Route path="/vendas/pedidos" element={<div>Pedidos</div>} />
            <Route path="/vendas/pdv" element={<div>PDV</div>} />
            <Route path="/vendas/propostas" element={<div>Propostas</div>} />
            <Route path="/produtos" element={<div>Produtos</div>} />
            <Route path="/produtos/estoque" element={<div>Estoque</div>} />
            <Route path="/produtos/categorias" element={<div>Categorias</div>} />
            <Route path="/compras" element={<div>Compras</div>} />
            <Route path="/compras/cotacoes" element={<div>Cotações</div>} />
            <Route path="/clientes" element={<div>Clientes</div>} />
            <Route path="/clientes/fornecedores" element={<div>Fornecedores</div>} />
            <Route path="/financeiro" element={<div>Financeiro</div>} />
            <Route path="/financeiro/pagar" element={<div>Contas a Pagar</div>} />
            <Route path="/financeiro/receber" element={<div>Contas a Receber</div>} />
            <Route path="/financeiro/conciliacao" element={<div>Conciliação</div>} />
            <Route path="/notas-fiscais" element={<div>Notas Fiscais</div>} />
            <Route path="/notas-fiscais/nfe" element={<div>NFe</div>} />
            <Route path="/notas-fiscais/nfce" element={<div>NFCe</div>} />
            <Route path="/notas-fiscais/nfse" element={<div>NFSe</div>} />
            <Route path="/emissao-fiscal" element={<div>Emissão Fiscal</div>} />
            <Route path="/producao" element={<div>Produção</div>} />
            <Route path="/producao/os" element={<div>Ordens de Serviço</div>} />
            <Route path="/relatorios" element={<div>Relatórios</div>} />
            <Route path="/integracoes" element={<div>Integrações</div>} />
            <Route path="/configuracoes" element={<div>Configurações</div>} />
            <Route path="/configuracoes/nfe" element={<div>Configuração NFE.io</div>} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="/admin/planos" element={<ProtectedRoute requireAdmin><AdminPlanos /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin><AdminUsuarios /></ProtectedRoute>} />
            <Route path="/admin/integracoes" element={<ProtectedRoute requireAdmin><AdminIntegracoes /></ProtectedRoute>} />
            <Route path="/admin/notificacoes" element={<ProtectedRoute requireAdmin><AdminNotificacoes /></ProtectedRoute>} />
            <Route path="/admin/backup" element={<ProtectedRoute requireSuperAdmin><AdminBackup /></ProtectedRoute>} />
            <Route path="/admin/integracao-erp" element={<ProtectedRoute requireAdmin><IntegracaoERP /></ProtectedRoute>} />
            
            <Route path="*" element={<div>404 - Not Found</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
