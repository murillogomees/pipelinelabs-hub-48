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
import { Loader2, Settings, Plus, ExternalLink } from 'lucide-react';

interface ConfigField {
  field: string;
  type: string;
  label: string;
  required: boolean;
}

interface IntegrationAvailable {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url?: string | null;
  config_schema: any;
  visible_to_companies: boolean;
}

interface ActiveIntegration {
  id: string;
  integration_available_id: string | null;
  platform_name: string;
  is_active: boolean;
  integration_available?: IntegrationAvailable | null;
}

const getTypeColor = (type: string) => {
  const colors = {
    marketplace: 'bg-blue-100 text-blue-800',
    logistica: 'bg-green-100 text-green-800',
    financeiro: 'bg-yellow-100 text-yellow-800',
    api: 'bg-purple-100 text-purple-800',
    comunicacao: 'bg-pink-100 text-pink-800',
    contabilidade: 'bg-indigo-100 text-indigo-800',
    personalizada: 'bg-gray-100 text-gray-800'
  };
  return colors[type as keyof typeof colors] || colors.personalizada;
};

const getTypeLabel = (type: string) => {
  const labels = {
    marketplace: 'Marketplace',
    logistica: 'Logística',
    financeiro: 'Financeiro',
    api: 'API',
    comunicacao: 'Comunicação',
    contabilidade: 'Contabilidade',
    personalizada: 'Personalizada'
  };
  return labels[type as keyof typeof labels] || 'Outro';
};

const parseConfigSchema = (schema: any): ConfigField[] => {
  try {
    if (Array.isArray(schema)) {
      return schema.filter(field => 
        field && typeof field === 'object' && 
        'field' in field && 'type' in field && 'label' in field
      ) as ConfigField[];
    }
    return [];
  } catch {
    return [];
  }
};

export function Integracoes() {
  const [configDialog, setConfigDialog] = useState<{open: boolean, integration?: IntegrationAvailable}>({open: false});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar integrações disponíveis para a empresa
  const { data: availableIntegrations, isLoading: loadingAvailable } = useQuery({
    queryKey: ['integrations-available'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_available')
        .select('*')
        .eq('visible_to_companies', true);
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar integrações ativas da empresa
  const { data: activeIntegrations, isLoading: loadingActive } = useQuery({
    queryKey: ['company-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select(`
          *,
          integration_available:integrations_available(*)
        `);
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Criar configuração dinâmica do formulário
  const createFormSchema = (configSchema: ConfigField[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    configSchema.forEach(field => {
      if (field.type === 'text' || field.type === 'password') {
        schemaFields[field.field] = field.required 
          ? z.string().min(1, `${field.label} é obrigatório`)
          : z.string().optional();
      } else if (field.type === 'boolean') {
        schemaFields[field.field] = z.boolean().optional();
      }
    });
    
    return z.object(schemaFields);
  };

  // Ativar integração
  const activateIntegration = useMutation({
    mutationFn: async ({ integrationId, credentials }: { integrationId: string, credentials: Record<string, any> }) => {
      // Buscar company_id do usuário atual
      const { data: userCompany, error: companyError } = await supabase
        .rpc('get_user_company_id');
      
      if (companyError || !userCompany) throw new Error('Empresa não encontrada');

      // Criptografar as credenciais
      const { data: encryptedData, error: encryptError } = await supabase
        .rpc('encrypt_integration_data', { data: credentials });
      
      if (encryptError) throw encryptError;

      const { data, error } = await supabase
        .from('integrations')
        .insert({
          company_id: userCompany,
          integration_available_id: integrationId,
          platform_name: availableIntegrations?.find(i => i.id === integrationId)?.name || '',
          integration_type: 'external',
          api_credentials: encryptedData,
          is_active: true
        });
      
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
        .from('integrations')
        .update({ is_active: false })
        .eq('id', integrationId);
      
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

  const ConfigurationDialog = ({ integration }: { integration: IntegrationAvailable }) => {
    const configSchema = parseConfigSchema(integration.config_schema);
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
                name={field.field as any}
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
                            {field.label}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type={field.type === 'password' ? 'password' : 'text'}
                          placeholder={`Digite ${field.label.toLowerCase()}`}
                          {...formField}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex justify-end space-x-2">
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
    return activeIntegrations?.some(
      ai => ai.integration_available_id === integrationId && ai.is_active
    );
  };

  const getActiveIntegration = (integrationId: string) => {
    return activeIntegrations?.find(
      ai => ai.integration_available_id === integrationId && ai.is_active
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte seu ERP com outras plataformas e serviços
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableIntegrations?.map((integration) => {
          const isActive = isIntegrationActive(integration.id);
          const activeIntegration = getActiveIntegration(integration.id);

          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge className={getTypeColor(integration.type)}>
                      {getTypeLabel(integration.type)}
                    </Badge>
                  </div>
                  {integration.logo_url && (
                    <img 
                      src={integration.logo_url} 
                      alt={integration.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
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
                        onClick={() => {
                          if (activeIntegration) {
                            deactivateIntegration.mutate(activeIntegration.id);
                          }
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
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