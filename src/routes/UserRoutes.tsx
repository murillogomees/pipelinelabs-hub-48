
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/User/UserProfile';
import { UserSettings } from '@/components/User/UserSettings';

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
