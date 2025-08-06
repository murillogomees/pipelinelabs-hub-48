
import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyLoader } from '@/components/common/LazyLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { MainLayout } from '@/components/Layout/MainLayout';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));
const Sales = lazy(() => import('@/pages/Sales'));
const Customers = lazy(() => import('@/pages/Customers'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Pos = lazy(() => import('@/pages/Pos'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const UserProfile = lazy(() => import('@/components/User/UserProfile'));
const UserSettings = lazy(() => import('@/components/User/UserSettings'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminAuditLogs = lazy(() => import('@/pages/AdminAuditLogs'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminEmpresas = lazy(() => import('@/pages/AdminEmpresas'));
const AdminAccessLevels = lazy(() => import('@/pages/AdminAccessLevels'));
const AdminIntegracoes = lazy(() => import('@/pages/AdminIntegracoes'));
const AdminNotificacoes = lazy(() => import('@/pages/AdminNotificacoes'));
const AdminBackup = lazy(() => import('@/pages/AdminBackup'));
const AdminMonitoramento = lazy(() => import('@/pages/AdminMonitoramento'));
const AdminCodeAnalysis = lazy(() => import('@/pages/AdminCodeAnalysis'));

export function UserRoutes() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar collapsed={false} onNavigate={() => {}} />
          <main className="flex-1">
            <MainLayout>
              <LazyLoader>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="produtos/*" element={<Products />} />
                  <Route path="vendas/*" element={<Sales />} />
                  <Route path="clientes/*" element={<Customers />} />
                  <Route path="pos/*" element={<Pos />} />
                  <Route path="relatorios/*" element={<Reports />} />
                  <Route path="analytics/*" element={<Analytics />} />
                  <Route path="configuracoes/*" element={<Settings />} />
                  <Route path="user/profile" element={<UserProfile />} />
                  <Route path="user/settings" element={<UserSettings />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
                  <Route path="admin/usuarios" element={<AdminUsers />} />
                  <Route path="admin/empresas" element={<AdminEmpresas />} />
                  <Route path="admin/access-levels" element={<AdminAccessLevels />} />
                  <Route path="admin/integracoes" element={<AdminIntegracoes />} />
                  <Route path="admin/notificacoes" element={<AdminNotificacoes />} />
                  <Route path="admin/backup" element={<AdminBackup />} />
                  <Route path="admin/monitoramento" element={<AdminMonitoramento />} />
                  <Route path="admin/code-analysis" element={<AdminCodeAnalysis />} />
                  <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                </Routes>
              </LazyLoader>
            </MainLayout>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
