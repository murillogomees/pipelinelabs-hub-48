import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ProductionDashboard } from '@/components/Production/ProductionDashboard';
import { PermissionGuard } from '@/components/PermissionGuard';

export default function AdminProducao() {
  return (
    <PermissionGuard requiredPermissions={["admin_panel"]}>
      <MainLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <PageHeader
            title="Administração de Produção"
            description="Monitoramento e configurações do ambiente de produção"
          />
          <ProductionDashboard />
        </div>
      </MainLayout>
    </PermissionGuard>
  );
}