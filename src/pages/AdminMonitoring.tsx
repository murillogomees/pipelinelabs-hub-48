
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function AdminMonitoring() {
  return (
    <AdminPageLayout
      title="Monitoramento do Sistema"
      description="Monitore performance e saúde do sistema"
      icon={<Activity className="h-6 w-6" />}
    >
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de monitoramento em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
