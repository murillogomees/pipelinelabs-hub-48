
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Vendas } from "@/pages/Vendas";
import { Produtos } from "@/pages/Produtos";
import { Clientes } from "@/pages/Clientes";
import Financeiro from "@/pages/Financeiro";
import { NotasFiscais } from "@/pages/NotasFiscais";
import { Producao } from "@/pages/Producao";
import Compras from "@/pages/Compras";
import { Admin } from "@/pages/Admin";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { Auth } from "@/pages/Auth";
import { useAuth } from "@/components/Auth/AuthProvider";
import { SignUpCompany } from "@/pages/SignUpCompany";
import { Integracoes } from "@/pages/Integracoes";
import { AdminIntegracoes } from "@/pages/AdminIntegracoes";
import AdminUsuarios from "@/pages/AdminUsuarios";
import { AdminPlanos } from "@/pages/AdminPlanos";
import IntegracaoERP from '@/pages/IntegracaoERP';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ConfiguracoesIntegracoes } from "@/pages/ConfiguracoesIntegracoes";
import { Notificacoes } from "@/pages/Notificacoes";
import { AdminNotificacoes } from "@/pages/AdminNotificacoes";
import { Relatorios } from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";
import ConfiguracaoNFe from "@/pages/ConfiguracaoNFe";
import { EmissaoFiscal } from "@/pages/EmissaoFiscal";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/cadastro-empresa" element={user ? <Navigate to="/" replace /> : <SignUpCompany />} />
        
        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/app" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/vendas/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Vendas />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/produtos/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Produtos />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/clientes/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Clientes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/financeiro/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Financeiro />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/notas-fiscais/*" element={
          <ProtectedRoute>
            <MainLayout>
              <NotasFiscais />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/producao/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Producao />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/compras/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Compras />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/relatorios/*" element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        } />
        
        <Route path="/integracoes/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Integracoes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/notificacoes" element={
          <ProtectedRoute>
            <MainLayout>
              <Notificacoes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/configuracoes/*" element={
          <ProtectedRoute>
            <Configuracoes />
          </ProtectedRoute>
        } />
        
        <Route path="/configuracoes/integracoes" element={
          <ProtectedRoute>
            <MainLayout>
              <ConfiguracoesIntegracoes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/configuracoes/nfe" element={
          <ProtectedRoute>
            <MainLayout>
              <ConfiguracaoNFe />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/emissao-fiscal" element={
          <ProtectedRoute>
            <MainLayout>
              <EmissaoFiscal />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/planos/*" element={
          <ProtectedRoute>
            <MainLayout>
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Planos</h1>
                <p className="text-muted-foreground">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Rotas administrativas */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <Admin />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/integracoes" element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <AdminIntegracoes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/usuarios" element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <AdminUsuarios />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/planos" element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <AdminPlanos />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/integracao-erp" element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <IntegracaoERP />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/notificacoes" element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <AdminNotificacoes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
