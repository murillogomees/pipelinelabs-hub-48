
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Vendas from '@/pages/Vendas';
import Produtos from '@/pages/Produtos';
import Compras from '@/pages/Compras';
import Clientes from '@/pages/Clientes';
import Financeiro from '@/pages/Financeiro';
import NotasFiscais from '@/pages/NotasFiscais';
import Producao from '@/pages/Producao';
import Relatorios from '@/pages/Relatorios';
import Analytics from '@/pages/Analytics';
import MarketplaceChannels from '@/pages/MarketplaceChannels';
import Configuracoes from '@/pages/Configuracoes';
import UserDadosPessoais from '@/pages/UserDadosPessoais';
import Admin from '@/pages/Admin';
import AdminUsuarios from '@/pages/AdminUsuarios';
import AdminIntegracoes from '@/pages/AdminIntegracoes';
import AdminNotificacoes from '@/pages/AdminNotificacoes';
import AdminBackup from '@/pages/AdminBackup';
import AdminCache from '@/pages/AdminCache';
import AdminCompressao from '@/pages/AdminCompressao';
import AdminMonitoramento from '@/pages/AdminMonitoramento';
import AdminVersions from '@/pages/AdminVersions';
import AdminAuditLogs from '@/pages/AdminAuditLogs';
import AdminLandingPage from '@/pages/AdminLandingPage';
import { PermissionProvider } from '@/components/PermissionProvider';
import { Toaster } from '@/components/ui/toaster';

const AdminPromptGenerator = React.lazy(() => import('@/pages/AdminPromptGenerator'));

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Router>
          <div className="container">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="vendas" element={<Vendas />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="compras" element={<Compras />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="notas-fiscais" element={<NotasFiscais />} />
              <Route path="producao" element={<Producao />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="marketplace-channels" element={<MarketplaceChannels />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="user/*" element={
                <Routes>
                  <Route path="dados-pessoais" element={<UserDadosPessoais />} />
                </Routes>
              } />
              <Route path="admin/*" element={
                <ProtectedRoute requireSuperAdmin>
                  <Routes>
                    <Route path="" element={<Admin />} />
                    <Route path="usuarios" element={<AdminUsuarios />} />
                    <Route path="integracoes" element={<AdminIntegracoes />} />
                    <Route path="notificacoes" element={<AdminNotificacoes />} />
                    <Route path="backup" element={<AdminBackup />} />
                    <Route path="cache" element={<AdminCache />} />
                    <Route path="compressao" element={<AdminCompressao />} />
                    <Route path="monitoramento" element={<AdminMonitoramento />} />
                    <Route path="versions" element={<AdminVersions />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                    <Route path="landing-page" element={<AdminLandingPage />} />
                    <Route path="prompt-generator" element={<AdminPromptGenerator />} />
                  </Routes>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
