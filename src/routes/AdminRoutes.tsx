import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SuperAdminOnly } from '@/components/ProtectedRoute/SuperAdminOnly';

// Admin Dashboard
const AdminHome = lazy(() => import('@/pages/Admin'));

// Feature pages already implemented
const AdminUsuarios = lazy(() => import('@/pages/AdminUsuarios'));
const AdminEmpresas = lazy(() => import('@/pages/AdminEmpresas'));
const AdminAccessLevels = lazy(() => import('@/pages/AdminAccessLevels'));
const AdminIntegracoes = lazy(() => import('@/pages/AdminIntegracoes'));
const AdminNotificacoes = lazy(() => import('@/pages/AdminNotificacoes'));
const AdminBackup = lazy(() => import('@/pages/AdminBackup'));
const AdminCache = lazy(() => import('@/pages/AdminCache'));
const AdminCompressao = lazy(() => import('@/pages/AdminCompressao'));
const AdminMonitoramento = lazy(() => import('@/pages/AdminMonitoramento'));
const AdminVersions = lazy(() => import('@/pages/AdminVersions'));
const AdminLandingPage = lazy(() => import('@/pages/AdminLandingPage'));
const AdminFuncao = lazy(() => import('@/pages/Admin/GPTPipelinePage'));

export function AdminRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        {/* Default admin dashboard */}
        <Route index element={<AdminHome />} />

        {/* Mapped to existing feature pages */}
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
        <Route path="funcao" element={<SuperAdminOnly><AdminFuncao /></SuperAdminOnly>} />
      </Routes>
    </ProtectedRoute>
  );
}
