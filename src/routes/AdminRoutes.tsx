
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Placeholder components
const AdminDashboard = () => <div>Dashboard Admin</div>;
const AdminUsers = () => <div>Gerenciar Usuários</div>;

export function AdminRoutes() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
      </Routes>
    </ProtectedRoute>
  );
}
