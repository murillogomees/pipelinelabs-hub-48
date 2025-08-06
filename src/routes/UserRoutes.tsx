
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Criar páginas básicas de usuário
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const UserSettings = lazy(() => import('@/pages/UserSettings'));

export function UserRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<UserSettings />} />
      </Routes>
    </ProtectedRoute>
  );
}
