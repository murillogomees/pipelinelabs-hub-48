import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Plus, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { getTypeColor, getTypeLabel } from '@/components/Admin/Integrations/utils';
import type { IntegrationAvailable, CompanyIntegration, ConfigField } from '@/components/Admin/Integrations/types';

export function ConfiguracoesIntegracoes() {
  const [configDialog, setConfigDialog] = useState<{open: boolean, integration?: IntegrationAvailable}>({open: false});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar integrações disponíveis para a empresa
  const { data: availableIntegrations, isLoading: loadingAvailable } = useQuery({
    queryKey: ['integrations-available-company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_available')
        .select('*')
        .eq('visible_to_companies', true);
      
      if (error) throw error;
      return data as any;
    }
  });

  // Buscar integrações ativas da empresa
  const { data: companyIntegrations, isLoading: loadingActive } = useQuery({
    queryKey: ['company-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_integrations')
        .select(`
          *,
          integration_available:integration_id(*)
        `);
      
      if (error) throw error;
      return data as any;
    }
  });

  // Criar schema dinâmico do formulário
  const createFormSchema = (configSchema: ConfigField[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    configSchema.forEach(field => {
      if (field.type === 'email') {
        schemaFields[field.field] = field.required 
          ? z.string().email('E-mail inválido').min(1, `${field.label} é obrigatório`)
          : z.string().email('E-mail inválido').optional().or(z.literal(''));
      } else if (field.type === 'url') {
        schemaFields[field.field] = field.required 
          ? z.string().url('URL inválida').min(1, `${field.label} é obrigatório`)
          : z.string().url('URL inválida').optional().or(z.literal(''));
      } else if (field.type === 'number') {
        schemaFields[field.field] = field.required 
          ? z.number().min(1, `${field.label} é obrigatório`)
          : z.number().optional();
      } else if (field.type === 'boolean') {
        schemaFields[field.field] = z.boolean().optional();
      } else {
        schemaFields[field.field] = field.required 
          ? z.string().min(1, `${field.label} é obrigatório`)
          : z.string().optional();
      }
    });
    
    return z.object(schemaFields);
  };

  // Ativar integração
  const activateIntegration = useMutation({
    mutationFn: async ({ integrationId, credentials }: { integrationId: string, credentials: Record<string, any> }) => {
      const { data: userCompany, error: companyError } = await supabase.rpc('get_user_company_id');
      
      if (companyError || !userCompany) throw new Error('Empresa não encontrada');

      // Criptografar as credenciais
      const { data: encryptedData, error: encryptError } = await supabase
        .rpc('encrypt_integration_data', { data: credentials });
      
      if (encryptError) throw encryptError;

      const { data, error } = await supabase
        .from('company_integrations')
        .upsert({
          company_id: userCompany,
          integration_id: integrationId,
          is_active: true,
          credentials: encryptedData,
          config: credentials
        }, {
          onConflict: 'company_id,integration_id'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-integrations'] });
      setConfigDialog({open: false});
      toast({
        title: 'Integração ativada',
        description: 'A integração foi configurada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao ativar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Desativar integração
  const deactivateIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('company_integrations')
        .update({ is_active: false })
        .eq('integration_id', integrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-integrations'] });
      toast({
        title: 'Integração desativada',
        description: 'A integração foi desativada com sucesso.',
      });
    }
  });

  // Testar conexão da integração
  const testConnection = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data, error } = await supabase
        .from('company_integrations')
        .update({ last_tested: new Date().toISOString() })
        .eq('integration_id', integrationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-integrations'] });
      toast({
        title: 'Teste realizado',
        description: 'Conexão testada com sucesso.',
      });
    }
  });

  const ConfigurationDialog = ({ integration }: { integration: IntegrationAvailable }) => {
    const configSchema = integration.config_schema || [];
    const formSchema = createFormSchema(configSchema);
    
    const form = useForm<any>({
      resolver: zodResolver(formSchema),
      defaultValues: {}
    });

    const onSubmit = (values: Record<string, any>) => {
      activateIntegration.mutate({
        integrationId: integration.id,
        credentials: values
      });
    };

    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar {integration.name}</DialogTitle>
          <DialogDescription>
            {integration.description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {configSchema.map((field, index) => (
              <FormField
                key={`${field.field}-${index}`}
                control={form.control}
                name={field.field}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === 'boolean' ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formField.value || false}
                            onCheckedChange={formField.onChange}
                          />
                          <span className="text-sm text-muted-foreground">
                            {field.description || field.label}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type={field.type === 'password' && !showPasswords[field.field] ? 'password' : 
                                  field.type === 'number' ? 'number' : 'text'}
                            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
                            {...formField}
                          />
                          {field.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPasswords(prev => ({
                                ...prev,
                                [field.field]: !prev[field.field]
                              }))}
                            >
                              {showPasswords[field.field] ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                          )}
                        </div>
                      )}
                    </FormControl>
                    {field.description && field.type !== 'boolean' && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setConfigDialog({open: false})}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={activateIntegration.isPending}
              >
                {activateIntegration.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ativar Integração
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    );
  };

  if (loadingAvailable || loadingActive) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isIntegrationActive = (integrationId: string) => {
    return companyIntegrations?.some(
      ci => ci.integration_id === integrationId && ci.is_active
    );
  };

  const getCompanyIntegration = (integrationId: string) => {
    return companyIntegrations?.find(
      ci => ci.integration_id === integrationId && ci.is_active
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground">
          Configure e gerencie as integrações da sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableIntegrations?.map((integration) => {
          const isActive = isIntegrationActive(integration.id);
          const companyIntegration = getCompanyIntegration(integration.id);

          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {integration.logo_url && (
                        <img 
                          src={integration.logo_url} 
                          alt={integration.name}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Badge className={getTypeColor(integration.type)}>
                      {getTypeLabel(integration.type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm min-h-[2.5rem]">
                  {integration.description}
                </CardDescription>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium">
                      {isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {isActive ? (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testConnection.mutate(integration.id)}
                        disabled={testConnection.isPending}
                      >
                        {testConnection.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Settings className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deactivateIntegration.mutate(integration.id)}
                      >
                        Desativar
                      </Button>
                    </div>
                  ) : (
                    <Dialog 
                      open={configDialog.open && configDialog.integration?.id === integration.id}
                      onOpenChange={(open) => setConfigDialog({open, integration: open ? integration : undefined})}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Ativar
                        </Button>
                      </DialogTrigger>
                      <ConfigurationDialog integration={integration} />
                    </Dialog>
                  )}
                </div>

                {companyIntegration?.last_tested && (
                  <div className="text-xs text-muted-foreground">
                    Última verificação: {new Date(companyIntegration.last_tested).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!availableIntegrations || availableIntegrations.length === 0) && (
        <div className="text-center py-12">
          <ExternalLink className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma integração disponível</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre em contato com o suporte para liberar integrações para sua empresa.
          </p>
        </div>
      )}
    </div>
  );
}