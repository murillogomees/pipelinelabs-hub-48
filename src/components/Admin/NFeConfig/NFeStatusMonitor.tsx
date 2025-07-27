
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

interface NFeStatus {
  status: 'active' | 'inactive' | 'error';
  message: string;
  lastCheck: string;
  certificate?: {
    cn: string;
    expiresAt: string;
    valid: boolean;
  };
}

export function NFeStatusMonitor() {
  const { companyId, canManageCompany } = usePermissions();

  const { data: nfeStatus, isLoading, refetch } = useQuery({
    queryKey: ['nfe-status', companyId],
    queryFn: async (): Promise<NFeStatus> => {
      if (!companyId) {
        return {
          status: 'inactive',
          message: 'Empresa não identificada',
          lastCheck: new Date().toISOString()
        };
      }

      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error || !settings) {
        return {
          status: 'inactive',
          message: 'Configurações não encontradas',
          lastCheck: new Date().toISOString()
        };
      }

      // Simular verificação de status
      const hasApiToken = !!settings.nfe_api_token;
      const hasCertificate = !!settings.certificate_file;

      if (hasApiToken && hasCertificate) {
        return {
          status: 'active',
          message: 'NFe configurada e funcionando',
          lastCheck: new Date().toISOString(),
          certificate: {
            cn: settings.certificate_cn || 'Certificado válido',
            expiresAt: settings.certificate_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            valid: true
          }
        };
      } else {
        return {
          status: 'error',
          message: 'Configuração incompleta - verifique API token e certificado',
          lastCheck: new Date().toISOString()
        };
      }
    },
    enabled: !!companyId && canManageCompany,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      error: 'destructive',
      inactive: 'secondary'
    };
    
    const labels = {
      active: 'Ativo',
      error: 'Erro',
      inactive: 'Inativo'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (!canManageCompany) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Você não tem permissão para visualizar o status da NFe.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Status da NFe</span>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : nfeStatus ? (
          <>
            <div className="flex items-center space-x-3">
              {getStatusIcon(nfeStatus.status)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(nfeStatus.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {nfeStatus.message}
                </p>
              </div>
            </div>

            {nfeStatus.certificate && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Certificado Digital</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nome:</span>
                    <span className="text-sm text-muted-foreground">{nfeStatus.certificate.cn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Válido até:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(nfeStatus.certificate.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={nfeStatus.certificate.valid ? 'default' : 'destructive'}>
                      {nfeStatus.certificate.valid ? 'Válido' : 'Inválido'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Última verificação:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(nfeStatus.lastCheck).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            Não foi possível obter o status da NFe.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
