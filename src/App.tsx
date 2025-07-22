import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        {/* Rota principal - Dashboard para usuários autenticados */}
        <Route path="/" element={
          user ? (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          ) : (
            <Auth />
          )
        } />
        
        {/* Rota pública para cadastro de empresa */}
        <Route path="/cadastro-empresa" element={
          user ? (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          ) : (
            <SignUpCompany />
          )
        } />
        
        {/* Rota de autenticação para usuários não autenticados */}
        <Route path="/auth" element={
          user ? (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          ) : (
            <Auth />
          )
        } />
        <Route path="/login" element={
          user ? (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          ) : (
            <Auth />
          )
        } />
        
        {/* Rotas protegidas para usuários autenticados */}
        {user ? (
          <>
            <Route path="/app" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            <Route path="/vendas/*" element={
              <MainLayout>
                <Vendas />
              </MainLayout>
            } />
            <Route path="/produtos/*" element={
              <MainLayout>
                <Produtos />
              </MainLayout>
            } />
            <Route path="/clientes/*" element={
              <MainLayout>
                <Clientes />
              </MainLayout>
            } />
            <Route path="/financeiro/*" element={
              <MainLayout>
                <Financeiro />
              </MainLayout>
            } />
            <Route path="/notas-fiscais/*" element={
              <MainLayout>
                <NotasFiscais />
              </MainLayout>
            } />
            <Route path="/producao/*" element={
              <MainLayout>
                <Producao />
              </MainLayout>
            } />
            <Route path="/compras/*" element={
              <MainLayout>
                <Compras />
              </MainLayout>
            } />
            <Route path="/relatorios/*" element={<Relatorios />} />
            <Route path="/integracoes/*" element={
              <MainLayout>
                <Integracoes />
              </MainLayout>
            } />
            <Route path="/admin" element={
              <MainLayout>
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              </MainLayout>
            } />
            <Route path="/admin/integracoes" element={
              <MainLayout>
                <ProtectedRoute requireAdmin>
                  <AdminIntegracoes />
                </ProtectedRoute>
              </MainLayout>
            } />
            <Route path="/admin/usuarios" element={
              <MainLayout>
                <ProtectedRoute requireAdmin>
                  <AdminUsuarios />
                </ProtectedRoute>
              </MainLayout>
            } />
            <Route path="/admin/planos" element={
              <MainLayout>
                <ProtectedRoute requireAdmin>
                  <AdminPlanos />
                </ProtectedRoute>
              </MainLayout>
            } />
            <Route path="/admin/integracao-erp" element={
              <MainLayout>
                <IntegracaoERP />
              </MainLayout>
            } />
            <Route path="/admin/notificacoes" element={
              <MainLayout>
                <ProtectedRoute requireAdmin>
                  <AdminNotificacoes />
                </ProtectedRoute>
              </MainLayout>
            } />
            <Route path="/planos/*" element={
              <MainLayout>
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold text-foreground">Planos</h1>
                  <p className="text-muted-foreground">Módulo em desenvolvimento</p>
                </div>
              </MainLayout>
            } />
            <Route path="/configuracoes/*" element={<Configuracoes />} />
            <Route path="/notificacoes" element={
              <MainLayout>
                <Notificacoes />
              </MainLayout>
            } />
            <Route path="/configuracoes/integracoes" element={
              <MainLayout>
                <ConfiguracoesIntegracoes />
              </MainLayout>
            } />
            <Route path="/configuracoes/nfe" element={
              <MainLayout>
                <ConfiguracaoNFe />
              </MainLayout>
            } />
            <Route path="/emissao-fiscal" element={
              <MainLayout>
                <EmissaoFiscal />
              </MainLayout>
            } />
          </>
        ) : null}
        
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
