
import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyLoader } from '@/components/common/LazyLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Layout/AppSidebar';
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

export function UserRoutes() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
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
