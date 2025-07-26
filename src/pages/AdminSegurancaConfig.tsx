
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurityConfig, useUpdateSecurityConfig } from '@/hooks/useSecurityConfig';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Clock, Database, AlertTriangle } from 'lucide-react';

export default function AdminSegurancaConfig() {
  const { data: securityConfig, isLoading } = useSecurityConfig();
  const updateConfig = useUpdateSecurityConfig();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <AdminPageLayout title="Configurações de Segurança" description="Carregando...">
        <div>Carregando configurações...</div>
      </AdminPageLayout>
    );
  }

  const handleUpdateConfig = async (configKey: string, newValue: any) => {
    try {
      await updateConfig(configKey as any, newValue);
      toast({
        title: 'Sucesso',
        description: 'Configuração de segurança atualizada',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar configuração',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminPageLayout 
      title="Configurações de Segurança" 
      description="Gerencie as configurações de segurança do sistema"
    >
      <Tabs defaultValue="passwords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="passwords" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Senhas
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="rate-limiting" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rate Limiting
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passwords">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Política de Senhas
              </CardTitle>
              <CardDescription>
                Configure os requisitos de segurança para senhas de usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_length">Comprimento Mínimo</Label>
                  <Input
                    id="min_length"
                    type="number"
                    value={securityConfig?.password_policy?.min_length || 8}
                    onChange={(e) => handleUpdateConfig('password_policy', {
                      ...securityConfig?.password_policy,
                      min_length: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_age_days">Validade (dias)</Label>
                  <Input
                    id="max_age_days"
                    type="number"
                    value={securityConfig?.password_policy?.max_age_days || 90}
                    onChange={(e) => handleUpdateConfig('password_policy', {
                      ...securityConfig?.password_policy,
                      max_age_days: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="require_uppercase">Exigir Maiúsculas</Label>
                  <Switch
                    id="require_uppercase"
                    checked={securityConfig?.password_policy?.require_uppercase || false}
                    onCheckedChange={(checked) => handleUpdateConfig('password_policy', {
                      ...securityConfig?.password_policy,
                      require_uppercase: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="require_lowercase">Exigir Minúsculas</Label>
                  <Switch
                    id="require_lowercase"
                    checked={securityConfig?.password_policy?.require_lowercase || false}
                    onCheckedChange={(checked) => handleUpdateConfig('password_policy', {
                      ...securityConfig?.password_policy,
                      require_lowercase: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="require_numbers">Exigir Números</Label>
                  <Switch
                    id="require_numbers"
                    checked={securityConfig?.password_policy?.require_numbers || false}
                    onCheckedChange={(checked) => handleUpdateConfig('password_policy', {
                      ...securityConfig?.password_policy,
                      require_numbers: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="require_special">Exigir Caracteres Especiais</Label>
                  <Switch
                    id="require_special"
                    checked={securityConfig?.password_policy?.require_special || false}
                    onCheckedChange={(checked) => handleUpdateConfig('password_policy', {
                      ...securityConfig?.password_policy,
                      require_special: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configurações de Sessão
              </CardTitle>
              <CardDescription>
                Gerencie configurações de segurança de sessões de usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_session_duration">Duração Máxima da Sessão (segundos)</Label>
                  <Input
                    id="max_session_duration"
                    type="number"
                    value={securityConfig?.session_settings?.max_session_duration || 28800}
                    onChange={(e) => handleUpdateConfig('session_settings', {
                      ...securityConfig?.session_settings,
                      max_session_duration: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="idle_timeout">Timeout de Inatividade (segundos)</Label>
                  <Input
                    id="idle_timeout"
                    type="number"
                    value={securityConfig?.session_settings?.idle_timeout || 3600}
                    onChange={(e) => handleUpdateConfig('session_settings', {
                      ...securityConfig?.session_settings,
                      idle_timeout: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require_2fa_for_admin">Exigir 2FA para Administradores</Label>
                <Switch
                  id="require_2fa_for_admin"
                  checked={securityConfig?.session_settings?.require_2fa_for_admin || false}
                  onCheckedChange={(checked) => handleUpdateConfig('session_settings', {
                    ...securityConfig?.session_settings,
                    require_2fa_for_admin: checked
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limiting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rate Limiting
              </CardTitle>
              <CardDescription>
                Configure limites de taxa para proteger contra ataques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Tentativas de Login</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Máximo de Tentativas</Label>
                    <Input
                      type="number"
                      value={securityConfig?.rate_limiting?.login_attempts?.max || 5}
                      onChange={(e) => handleUpdateConfig('rate_limiting', {
                        ...securityConfig?.rate_limiting,
                        login_attempts: {
                          ...securityConfig?.rate_limiting?.login_attempts,
                          max: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Janela de Tempo (segundos)</Label>
                    <Input
                      type="number"
                      value={securityConfig?.rate_limiting?.login_attempts?.window || 900}
                      onChange={(e) => handleUpdateConfig('rate_limiting', {
                        ...securityConfig?.rate_limiting,
                        login_attempts: {
                          ...securityConfig?.rate_limiting?.login_attempts,
                          window: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Operações Sensíveis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Máximo de Operações</Label>
                    <Input
                      type="number"
                      value={securityConfig?.rate_limiting?.sensitive_operations?.max || 10}
                      onChange={(e) => handleUpdateConfig('rate_limiting', {
                        ...securityConfig?.rate_limiting,
                        sensitive_operations: {
                          ...securityConfig?.rate_limiting?.sensitive_operations,
                          max: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Janela de Tempo (segundos)</Label>
                    <Input
                      type="number"
                      value={securityConfig?.rate_limiting?.sensitive_operations?.window || 3600}
                      onChange={(e) => handleUpdateConfig('rate_limiting', {
                        ...securityConfig?.rate_limiting,
                        sensitive_operations: {
                          ...securityConfig?.rate_limiting?.sensitive_operations,
                          window: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Retenção de Logs de Auditoria
              </CardTitle>
              <CardDescription>
                Configure por quanto tempo os logs de auditoria são mantidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Logs de Segurança (dias)</Label>
                  <Input
                    type="number"
                    value={securityConfig?.audit_retention?.security_logs_days || 365}
                    onChange={(e) => handleUpdateConfig('audit_retention', {
                      ...securityConfig?.audit_retention,
                      security_logs_days: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Logs de Auditoria (dias)</Label>
                  <Input
                    type="number"
                    value={securityConfig?.audit_retention?.audit_logs_days || 2555}
                    onChange={(e) => handleUpdateConfig('audit_retention', {
                      ...securityConfig?.audit_retention,
                      audit_logs_days: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Limpeza Automática Habilitada</Label>
                <Switch
                  checked={securityConfig?.audit_retention?.auto_cleanup_enabled || false}
                  onCheckedChange={(checked) => handleUpdateConfig('audit_retention', {
                    ...securityConfig?.audit_retention,
                    auto_cleanup_enabled: checked
                  })}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Aviso</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Logs de auditoria são importantes para compliance. Considere cuidadosamente os tempos de retenção.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
