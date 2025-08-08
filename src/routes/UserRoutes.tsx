
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SetupWaiting } from '@/components/Auth/SetupWaiting';
import { AppRoutes } from './AppRoutes';

export function UserRoutes() {
  return (
    <ProtectedRoute>
      <SetupWaiting>
        <AppRoutes />
      </SetupWaiting>
    </ProtectedRoute>
  );
}
