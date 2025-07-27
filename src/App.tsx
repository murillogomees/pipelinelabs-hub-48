
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { PermissionProvider } from '@/components/PermissionProvider';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Outlet } from 'react-router-dom';

// Core Pages
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import Produtos from '@/pages/Produtos';
import Vendas from '@/pages/Vendas';
import Compras from '@/pages/Compras';
import Financeiro from '@/pages/Financeiro';
import Estoque from '@/pages/Estoque';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';
import Analytics from '@/pages/Analytics';
import Producao from '@/pages/Producao';
import NotasFiscais from '@/pages/NotasFiscais';
import ConfiguracaoNFe from '@/pages/ConfiguracaoNFe';
import Integracoes from '@/pages/Integracoes';
import ConfiguracoesIntegracoes from '@/pages/ConfiguracoesIntegracoes';
import MarketplaceChannels from '@/pages/MarketplaceChannels';
import Notificacoes from '@/pages/Notificacoes';

// Admin Pages
import Admin from '@/pages/Admin';
import AdminUsuarios from '@/pages/AdminUsuarios';
import AdminNiveisAcesso from '@/pages/AdminNiveisAcesso';
import AdminAuditLogs from '@/pages/AdminAuditLogs';
import AdminIntegracoes from '@/pages/AdminIntegracoes';
import AdminIntegrations from '@/pages/AdminIntegrations';
import AdminNFeConfig from '@/pages/AdminNFeConfig';
import AdminVersions from '@/pages/AdminVersions';
import AdminMonitoramento from '@/pages/AdminMonitoramento';
import AdminMonitoring from '@/pages/AdminMonitoring';
import AdminSLA from '@/pages/AdminSLA';
import AdminSeguranca from '@/pages/AdminSeguranca';
import AdminSegurancaConfig from '@/pages/AdminSegurancaConfig';
import AdminNotificacoes from '@/pages/AdminNotificacoes';
import AdminNotifications from '@/pages/AdminNotifications';
import AdminBackup from '@/pages/AdminBackup';
import AdminCache from '@/pages/AdminCache';
import AdminCompressao from '@/pages/AdminCompressao';
import AdminPromptGenerator from '@/pages/AdminPromptGenerator';
import AdminLandingPage from '@/pages/AdminLandingPage';
import AdminAuditoria from '@/pages/AdminAuditoria';

// User Pages
import UserDadosPessoais from '@/pages/UserDadosPessoais';

// Other Pages
import SLA from '@/pages/SLA';
import Privacidade from '@/pages/Privacidade';
import TermosDeUso from '@/pages/TermosDeUso';
import NotFound from '@/pages/NotFound';
import { BreakpointTester } from '@/components/Testing/BreakpointTester';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PermissionProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sla" element={<SLA />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<TermosDeUso />} />
              <Route path="/breakpoint-test" element={<BreakpointTester />} />

              {/* Protected App Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Outlet />
                  </MainLayout>
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="vendas" element={<Vendas />} />
                <Route path="compras" element={<Compras />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="estoque" element={<Estoque />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="configuracoes" element={<Configuracoes />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="producao" element={<Producao />} />
                <Route path="notas-fiscais" element={<NotasFiscais />} />
                <Route path="configuracao-nfe" element={<ConfiguracaoNFe />} />
                <Route path="integracoes" element={<Integracoes />} />
                <Route path="configuracoes-integracoes" element={<ConfiguracoesIntegracoes />} />
                <Route path="marketplace-channels" element={<MarketplaceChannels />} />
                <Route path="notificacoes" element={<Notificacoes />} />

                {/* User Routes */}
                <Route path="user/dados-pessoais" element={<UserDadosPessoais />} />

                {/* Admin Routes */}
                <Route path="admin" element={
                  <ProtectedRoute requireSuperAdmin>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="admin/usuarios" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminUsuarios />
                  </ProtectedRoute>
                } />
                <Route path="admin/niveis-acesso" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminNiveisAcesso />
                  </ProtectedRoute>
                } />
                <Route path="admin/audit-logs" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                } />
                <Route path="admin/integracoes" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminIntegracoes />
                  </ProtectedRoute>
                } />
                <Route path="admin/integrations" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminIntegrations />
                  </ProtectedRoute>
                } />
                <Route path="admin/nfe-config" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminNFeConfig />
                  </ProtectedRoute>
                } />
                <Route path="admin/versions" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminVersions />
                  </ProtectedRoute>
                } />
                <Route path="admin/monitoramento" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminMonitoramento />
                  </ProtectedRoute>
                } />
                <Route path="admin/monitoring" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminMonitoring />
                  </ProtectedRoute>
                } />
                <Route path="admin/sla" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminSLA />
                  </ProtectedRoute>
                } />
                <Route path="admin/seguranca" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminSeguranca />
                  </ProtectedRoute>
                } />
                <Route path="admin/seguranca-config" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminSegurancaConfig />
                  </ProtectedRoute>
                } />
                <Route path="admin/notificacoes" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminNotificacoes />
                  </ProtectedRoute>
                } />
                <Route path="admin/notifications" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminNotifications />
                  </ProtectedRoute>
                } />
                <Route path="admin/backup" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminBackup />
                  </ProtectedRoute>
                } />
                <Route path="admin/cache" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminCache />
                  </ProtectedRoute>
                } />
                <Route path="admin/compressao" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminCompressao />
                  </ProtectedRoute>
                } />
                <Route path="admin/prompt-generator" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminPromptGenerator />
                  </ProtectedRoute>
                } />
                <Route path="admin/landing-page" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminLandingPage />
                  </ProtectedRoute>
                } />
                <Route path="admin/auditoria" element={
                  <ProtectedRoute requireSuperAdmin>
                    <AdminAuditoria />
                  </ProtectedRoute>
                } />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </PermissionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
