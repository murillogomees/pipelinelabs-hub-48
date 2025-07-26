
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'lucide-react';

export default function AdminIntegrations() {
  return (
    <AdminPageLayout
      title="Integrações Administrativas"
      description="Gerencie integrações do sistema e APIs externas"
      icon={<Link className="h-6 w-6" />}
    >
      <Card>
        <CardHeader>
          <CardTitle>Integrações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de integrações administrativas em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
