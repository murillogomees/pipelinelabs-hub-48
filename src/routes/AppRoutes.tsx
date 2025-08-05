
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoader } from '@/components/common/LazyLoader';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));
const Sales = lazy(() => import('@/pages/Sales'));
const Customers = lazy(() => import('@/pages/Customers'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Pos = lazy(() => import('@/pages/Pos'));

export function AppRoutes() {
  return (
    <LazyLoader>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="produtos/*" element={<Products />} />
        <Route path="vendas/*" element={<Sales />} />
        <Route path="clientes/*" element={<Customers />} />
        <Route path="pos/*" element={<Pos />} />
        <Route path="relatorios/*" element={<Reports />} />
        <Route path="configuracoes/*" element={<Settings />} />
      </Routes>
    </LazyLoader>
  );
}
