
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SetupWaiting } from '@/components/Auth/SetupWaiting';
import { AppRoutes } from './AppRoutes';
import { MainLayout } from '@/components/Layout/MainLayout';

export function UserRoutes() {
  return (
    <ProtectedRoute>
      <SetupWaiting>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </SetupWaiting>
    </ProtectedRoute>
  );
}
