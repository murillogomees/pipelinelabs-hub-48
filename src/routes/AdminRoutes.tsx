import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Admin dashboard (cards with links)
const AdminHome = lazy(() => import('@/pages/Admin'));

// Placeholder pages for each admin section (replace with real ones when available)
const AdminUsuarios = () => <div className="p-6">Gerenciar Usuários</div>;
const AdminEmpresas = () => <div className="p-6">Gerenciar Empresas</div>;
const AdminAccessLevels = () => <div className="p-6">Níveis de Acesso</div>;
const AdminIntegracoes = () => <div className="p-6">Integrações</div>;
const AdminNotificacoes = () => <div className="p-6">Notificações</div>;
const AdminBackup = () => <div className="p-6">Backup e Restauração</div>;
const AdminCache = () => <div className="p-6">Cache</div>;
const AdminCompressao = () => <div className="p-6">Compressão</div>;
const AdminMonitoramento = () => <div className="p-6">Monitoramento</div>;
const AdminVersions = () => <div className="p-6">Versões</div>;
const AdminLandingPage = () => <div className="p-6">Editor da Landing Page</div>;

export function AdminRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        {/* Default admin dashboard */}
        <Route index element={<AdminHome />} />

        {/* Match all links from Admin cards */}
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="empresas" element={<AdminEmpresas />} />
        <Route path="access-levels" element={<AdminAccessLevels />} />
        <Route path="integracoes" element={<AdminIntegracoes />} />
        <Route path="notificacoes" element={<AdminNotificacoes />} />
        <Route path="backup" element={<AdminBackup />} />
        <Route path="cache" element={<AdminCache />} />
        <Route path="compressao" element={<AdminCompressao />} />
        <Route path="monitoramento" element={<AdminMonitoramento />} />
        <Route path="versions" element={<AdminVersions />} />
        <Route path="landing-page" element={<AdminLandingPage />} />
      </Routes>
    </ProtectedRoute>
  );
}
