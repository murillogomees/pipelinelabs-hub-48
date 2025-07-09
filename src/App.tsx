
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Vendas } from "@/pages/Vendas";
import { Produtos } from "@/pages/Produtos";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { AuthForm } from "@/components/Auth/AuthForm";
import { useAuth } from "@/components/Auth/AuthProvider";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
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
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/financeiro/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/notas-fiscais/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/producao/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Produção</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/relatorios/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/integracoes/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/admin/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="/configuracoes/*" element={
          <MainLayout>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Módulo em desenvolvimento</p>
            </div>
          </MainLayout>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
