
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function AdminNotifications() {
  return (
    <AdminPageLayout
      title="Gerenciamento de Notificações"
      description="Configure o sistema de notificações e comunicação"
      icon={<Bell className="h-6 w-6" />}
    >
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Módulo de notificações em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
