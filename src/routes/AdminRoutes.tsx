
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoader } from '@/components/common/LazyLoader';

// Lazy load admin components
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminCompanies = lazy(() => import('@/pages/AdminCompanies'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminSettings = lazy(() => import('@/pages/AdminSettings'));
const AdminPerformance = lazy(() => import('@/pages/AdminPerformance'));
const AdminCache = lazy(() => import('@/pages/AdminCache'));

export function AdminRoutes() {
  return (
    <LazyLoader>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/empresas" element={<AdminCompanies />} />
        <Route path="/usuarios" element={<AdminUsers />} />
        <Route path="/configuracoes/*" element={<AdminSettings />} />
        <Route path="/performance" element={<AdminPerformance />} />
        <Route path="/cache" element={<AdminCache />} />
      </Routes>
    </LazyLoader>
  );
}
