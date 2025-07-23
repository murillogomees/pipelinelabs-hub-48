import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMonitoringDashboard } from '@/components/Admin/ErrorMonitoring/ErrorMonitoringDashboard';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function AdminMonitoramento() {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas super administradores podem acessar o monitoramento de erros.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Erros</h1>
          <p className="text-muted-foreground">
            Acompanhe erros e performance da aplicação em tempo real
          </p>
        </div>
      </div>

      <ErrorMonitoringDashboard />
    </div>
  );
}