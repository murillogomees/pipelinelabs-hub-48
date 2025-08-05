
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Placeholder components
const UserProfile = () => <div>Perfil do Usuário</div>;
const UserSettings = () => <div>Configurações do Usuário</div>;

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
