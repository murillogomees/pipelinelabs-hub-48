import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserDataManagement } from '@/components/LGPD/UserDataManagement';

export default function UserDadosPessoais() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <UserDataManagement />
      </div>
    </ProtectedRoute>
  );
}