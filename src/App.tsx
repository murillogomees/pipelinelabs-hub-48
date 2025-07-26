import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Vendas from '@/pages/Vendas';
import Produtos from '@/pages/Produtos';
import Clientes from '@/pages/Clientes';
import Compras from '@/pages/Compras';
import Estoque from '@/pages/Estoque';
import Financeiro from '@/pages/Financeiro';
import NotasFiscais from '@/pages/NotasFiscais';
import Producao from '@/pages/Producao';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';
import ConfiguracoesIntegracoes from '@/pages/ConfiguracoesIntegracoes';
import ConfiguracaoNFe from '@/pages/ConfiguracaoNFe';
import Integracoes from '@/pages/Integracoes';
import MarketplaceChannels from '@/pages/MarketplaceChannels';
import Analytics from '@/pages/Analytics';
import Notificacoes from '@/pages/Notificacoes';
import UserDadosPessoais from '@/pages/UserDadosPessoais';
import Admin from '@/pages/Admin';
import AdminUsuarios from '@/pages/AdminUsuarios';
import AdminIntegracoes from '@/pages/AdminIntegracoes';
import AdminMonitoramento from '@/pages/AdminMonitoramento';
import AdminSeguranca from '@/pages/AdminSeguranca';
import AdminSegurancaConfig from '@/pages/AdminSegurancaConfig';
import AdminBackup from '@/pages/AdminBackup';
import AdminCache from '@/pages/AdminCache';
import AdminCompressao from '@/pages/AdminCompressao';
import AdminVersions from '@/pages/AdminVersions';
import AdminLandingPage from '@/pages/AdminLandingPage';
import AdminPromptGenerator from '@/pages/AdminPromptGenerator';
import AdminNFeConfig from '@/pages/AdminNFeConfig';
import AdminAuditLogs from '@/pages/AdminAuditLogs';
import AdminSLA from '@/pages/AdminSLA';
import AdminNotificacoes from '@/pages/AdminNotificacoes';
import NotFound from '@/pages/NotFound';
import BreakpointTest from '@/pages/BreakpointTest';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import SLA from '@/pages/SLA';
import TermosDeUso from '@/pages/TermosDeUso';
import Privacidade from '@/pages/Privacidade';
import AdminNiveisAcesso from "@/pages/AdminNiveisAcesso";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/sla" element={<SLA />} />
          <Route path="/termos" element={<TermosDeUso />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="vendas" element={<Vendas />} />
                    <Route path="produtos" element={<Produtos />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="compras" element={<Compras />} />
                    <Route path="estoque" element={<Estoque />} />
                    <Route path="financeiro" element={<Financeiro />} />
                    <Route path="notas-fiscais" element={<NotasFiscais />} />
                    <Route path="producao" element={<Producao />} />
                    <Route path="relatorios" element={<Relatorios />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                    <Route path="configuracoes/integracoes" element={<ConfiguracoesIntegracoes />} />
                    <Route path="configuracoes/nfe" element={<ConfiguracaoNFe />} />
                    <Route path="integracoes" element={<Integracoes />} />
                    <Route path="marketplace-channels" element={<MarketplaceChannels />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="notificacoes" element={<Notificacoes />} />
                    <Route path="dados-pessoais" element={<UserDadosPessoais />} />
                    
                    {/* Rotas administrativas */}
                    <Route
                      path="admin"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/usuarios"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminUsuarios />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/niveis-acesso"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminNiveisAcesso />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/integracoes"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminIntegracoes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/monitoramento"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminMonitoramento />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/seguranca"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminSeguranca />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/seguranca/config"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminSegurancaConfig />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/backup"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminBackup />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/cache"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminCache />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/compressao"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminCompressao />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/versions"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminVersions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/landing-page"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminLandingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/prompt-generator"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminPromptGenerator />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/nfe-config"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminNFeConfig />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/audit-logs"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminAuditLogs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/sla"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminSLA />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin/notificacoes"
                      element={
                        <ProtectedRoute requireSuperAdmin>
                          <AdminNotificacoes />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route path="breakpoint-test" element={<BreakpointTest />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
