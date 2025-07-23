import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  action: string;
  user_email: string;
  user_name: string;
  old_values: any;
  new_values: any;
  created_at: string;
  severity: string;
  status: string;
}

export function CompanyAuditLog() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canViewLogs, setCanViewLogs] = useState(false);

  const fetchAuditLogs = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Verificar se usuário pode ver logs de auditoria
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id, user_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userCompany) {
        setCanViewLogs(false);
        return;
      }

      // Apenas contratantes e super admins podem ver logs
      const canView = userCompany.user_type === 'contratante' || 
                     userCompany.user_type === 'super_admin';
      setCanViewLogs(canView);

      if (!canView) return;

      // Buscar logs de auditoria relacionados à empresa
      const { data, error } = await supabase.rpc('get_audit_logs', {
        p_company_id: userCompany.company_id,
        p_resource_type: 'company',
        p_limit: 50,
        p_offset: 0
      });

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        return;
      }

      setAuditLogs(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar logs:', error);
      toast.error('Erro ao carregar histórico de alterações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user?.id]);

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'company:updated': 'Dados da empresa atualizados',
      'company:created': 'Empresa criada',
      'company:deleted': 'Empresa removida',
      'company:settings_updated': 'Configurações alteradas'
    };
    return actionMap[action] || action;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChanges = (oldValues: any, newValues: any) => {
    if (!newValues) return [];

    const changes = [];
    const fieldNames: Record<string, string> = {
      name: 'Nome da Empresa',
      legal_name: 'Razão Social',
      trade_name: 'Nome Fantasia',
      document: 'CNPJ',
      email: 'E-mail',
      fiscal_email: 'E-mail Fiscal',
      phone: 'Telefone',
      address: 'Endereço',
      city: 'Cidade',
      zipcode: 'CEP',
      state_registration: 'Inscrição Estadual',
      municipal_registration: 'Inscrição Municipal',
      tax_regime: 'Regime Tributário',
      legal_representative: 'Responsável Legal'
    };

    for (const [key, value] of Object.entries(newValues)) {
      if (oldValues && oldValues[key] !== value) {
        changes.push({
          field: fieldNames[key] || key,
          oldValue: oldValues[key] || 'Não informado',
          newValue: value || 'Não informado'
        });
      } else if (!oldValues) {
        changes.push({
          field: fieldNames[key] || key,
          oldValue: 'Não informado',
          newValue: value || 'Não informado'
        });
      }
    }

    return changes;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Histórico de Alterações</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando histórico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canViewLogs) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Histórico de Alterações</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">
              Acesso restrito. Apenas contratantes podem visualizar o histórico.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <div>
              <CardTitle>Histórico de Alterações</CardTitle>
              <CardDescription>
                Registro de todas as modificações nos dados da empresa
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditLogs}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhuma alteração registrada
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {auditLogs.map((log) => {
                const changes = getChanges(log.old_values, log.new_values);
                
                return (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {formatAction(log.action)}
                        </Badge>
                        {log.severity === 'high' && (
                          <Badge variant="destructive">Crítico</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{log.user_name || 'Sistema'}</span>
                      <span className="text-muted-foreground">({log.user_email})</span>
                    </div>

                    {changes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Alterações:</h4>
                        <div className="bg-muted rounded p-3 space-y-2">
                          {changes.map((change, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{change.field}:</span>
                              <div className="ml-2 space-y-1">
                                <div className="text-red-600">
                                  <span className="font-mono">- {change.oldValue}</span>
                                </div>
                                <div className="text-green-600">
                                  <span className="font-mono">+ {change.newValue}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}