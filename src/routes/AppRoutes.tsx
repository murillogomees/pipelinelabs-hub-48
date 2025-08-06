
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoader } from '@/components/common/LazyLoader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load components - apenas páginas que existem
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));
const Sales = lazy(() => import('@/pages/Sales'));
const Customers = lazy(() => import('@/pages/Customers'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));

export function AppRoutes() {
  return (
    <ProtectedRoute>
      <LazyLoader>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos/*" element={<Products />} />
          <Route path="vendas/*" element={<Sales />} />
          <Route path="clientes/*" element={<Customers />} />
          <Route path="relatorios/*" element={<Reports />} />
          <Route path="configuracoes/*" element={<Settings />} />
        </Routes>
      </LazyLoader>
    </ProtectedRoute>
  );
}
