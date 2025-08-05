
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Admin Pages
import Admin from '@/pages/Admin';
import AdminUsuarios from '@/pages/AdminUsuarios';
import AdminEmpresas from '@/pages/AdminEmpresas';
import AdminAccessLevels from '@/pages/AdminAccessLevels';
import AdminAuditLogs from '@/pages/AdminAuditLogs';
import AdminIntegracoes from '@/pages/AdminIntegracoes';
import AdminNFeConfig from '@/pages/AdminNFeConfig';
import AdminVersions from '@/pages/AdminVersions';
import AdminMonitoramento from '@/pages/AdminMonitoramento';
import AdminSLA from '@/pages/AdminSLA';
import AdminSegurancaConfig from '@/pages/AdminSegurancaConfig';
import AdminNotificacoes from '@/pages/AdminNotificacoes';
import AdminBackup from '@/pages/AdminBackup';
import AdminCache from '@/pages/AdminCache';
import AdminCompressao from '@/pages/AdminCompressao';
import AdminLandingPage from '@/pages/AdminLandingPage';
import AdminAuditoria from '@/pages/AdminAuditoria';

export function AdminRoutes() {
  return (
    <>
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
      <Route path="admin/empresas" element={
        <ProtectedRoute requireSuperAdmin>
          <AdminEmpresas />
        </ProtectedRoute>
      } />
      <Route path="admin/access-levels" element={
        <ProtectedRoute requireSuperAdmin>
          <AdminAccessLevels />
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
      <Route path="admin/sla" element={
        <ProtectedRoute requireSuperAdmin>
          <AdminSLA />
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
    </>
  );
}
