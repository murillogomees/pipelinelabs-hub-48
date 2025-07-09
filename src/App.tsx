
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Vendas } from "@/pages/Vendas";
import { Produtos } from "@/pages/Produtos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
              <div className="p-6">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/financeiro/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Financeiro</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/notas-fiscais/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Notas Fiscais</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/producao/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Produção</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/relatorios/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Relatórios</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/integracoes/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Integrações</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/admin/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Painel Administrativo</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="/configuracoes/*" element={
            <MainLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-gray-600 mt-2">Módulo em desenvolvimento</p>
              </div>
            </MainLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
