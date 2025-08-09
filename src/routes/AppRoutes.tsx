
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoader } from '@/components/common/LazyLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoutes } from '@/routes/AdminRoutes';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));
const Sales = lazy(() => import('@/pages/Sales'));
const Customers = lazy(() => import('@/pages/Customers'));
const Reports = lazy(() => import('@/pages/Reports'));
const Configuracoes = lazy(() => import('@/pages/Configuracoes'));
const Pos = lazy(() => import('@/pages/Pos'));

export function AppRoutes() {
  return (
    <ProtectedRoute>
      <LazyLoader>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos/*" element={<Products />} />
          <Route path="vendas/*" element={<Sales />} />
          <Route path="clientes/*" element={<Customers />} />
          <Route path="pos/*" element={<Pos />} />
          <Route path="relatorios/*" element={<Reports />} />
          <Route path="admin/*" element={<AdminRoutes />} />
          <Route path="configuracoes/*" element={<Configuracoes />} />
        </Routes>
      </LazyLoader>
    </ProtectedRoute>
  );
}
