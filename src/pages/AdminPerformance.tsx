import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PerformanceDashboard } from '@/components/Admin/PerformanceDashboard';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Activity } from 'lucide-react';

export default function AdminPerformance() {
  return (
    <AdminPageLayout
      title="Performance Monitor"
      description="Monitoramento em tempo real de performance do sistema"
      icon={<Activity className="w-8 h-8" />}
    >
      <PerformanceDashboard />
    </AdminPageLayout>
  );
}