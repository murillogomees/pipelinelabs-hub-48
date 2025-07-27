
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function NFeStatusMonitor() {
  const { isSuperAdmin, isContratante } = usePermissions();

  const { data: nfeStatus, refetch } = useQuery({
    queryKey: ['nfe-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('status')
        .eq('invoice_type', 'NFE')
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin || isContratante,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'emitida':
        return <Badge variant="default">Emitida</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'rejeitada':
        return <Badge variant="destructive">Rejeitada</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'emitida':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelada':
      case 'rejeitada':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pendente':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isSuperAdmin && !isContratante) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Você não tem permissão para visualizar o status das NFe.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status das NFe</span>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nfeStatus?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(item.status)}
                <span className="font-medium">NFe #{index + 1}</span>
              </div>
              {getStatusBadge(item.status)}
            </div>
          ))}
          {(!nfeStatus || nfeStatus.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma NFe encontrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
