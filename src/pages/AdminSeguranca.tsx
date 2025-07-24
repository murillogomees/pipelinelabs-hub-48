import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import SecurityMonitoringDashboard from '@/components/Security/SecurityMonitoringDashboard';

export default function AdminSeguranca() {
  return (
    <AdminPageLayout 
      title="Segurança"
      description="Monitoramento e configurações de segurança do sistema"
    >
      <SecurityMonitoringDashboard />
    </AdminPageLayout>
  );
}