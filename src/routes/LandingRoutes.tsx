
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from '@/pages/Auth';

// Placeholder landing page component
function LandingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo</h1>
        <p className="text-muted-foreground mb-8">Sistema de gestão empresarial</p>
        <div className="space-x-4">
          <a href="/auth" className="btn btn-primary">Entrar</a>
          <a href="/app" className="btn btn-secondary">Acessar Sistema</a>
        </div>
      </div>
    </div>
  );
}

export function LandingRoutes() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
