
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load apenas páginas admin que existem
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/AdminUsuarios'));
const AdminCompanies = lazy(() => import('@/pages/AdminEmpresas'));
const AdminBackup = lazy(() => import('@/pages/AdminBackup'));
const AdminCache = lazy(() => import('@/pages/AdminCache'));
const AdminVersions = lazy(() => import('@/pages/AdminVersions'));
const AdminSLA = lazy(() => import('@/pages/AdminSLA'));
const AdminLandingPage = lazy(() => import('@/pages/AdminLandingPage'));
const AdminCompressao = lazy(() => import('@/pages/AdminCompressao'));

export function AdminRoutes() {
  return (
    <ProtectedRoute requireAdmin>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="empresas" element={<AdminCompanies />} />
        <Route path="backup" element={<AdminBackup />} />
        <Route path="cache" element={<AdminCache />} />
        <Route path="versions" element={<AdminVersions />} />
        <Route path="sla" element={<AdminSLA />} />
        <Route path="landing-page" element={<AdminLandingPage />} />
        <Route path="compressao" element={<AdminCompressao />} />
      </Routes>
    </ProtectedRoute>
  );
}
