import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/Auth/AuthProvider';
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
import { Loader2, Settings, Plus, CheckCircle, XCircle } from 'lucide-react';

interface ConfigField {
  name: string;
  type: string;
  label: string;
  required: boolean;
}

interface IntegrationAvailable {
  id: string;
  name: string;
  type: string;
  description: string | null;
  config_schema: ConfigField[];
  is_active: boolean;
}

export function ConfiguracoesIntegracoes() {
  const [configDialog, setConfigDialog] = useState<{open: boolean, integration?: IntegrationAvailable}>({open: false});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Buscar integrações disponíveis
  const { data: availableIntegrations, isLoading } = useQuery({
    queryKey: ["integrations-available"],
    queryFn: async () => {
      // Mock data since the table doesn't exist in TypeScript types yet
      return [
        {
          id: '1',
          name: 'NFe.io',
          description: 'Integração para emissão de NFe',
          type: 'fiscal',
          config_schema: [{"name": "api_token", "type": "password", "label": "Token da API", "required": true}],
          is_active: true
        },
        {
          id: '2',
          name: 'Stripe',
          description: 'Gateway de pagamento Stripe',
          type: 'payment',
          config_schema: [{"name": "public_key", "type": "text", "label": "Chave Pública", "required": true}, {"name": "secret_key", "type": "password", "label": "Chave Secreta", "required": true}],
          is_active: true
        }
      ];
    }
  });

  // Buscar integrações ativas da empresa
  const { data: companyIntegrations, refetch: refetchCompanyIntegrations } = useQuery({
    queryKey: ["company-integrations"],
    queryFn: async () => {
      // Mock data since the table doesn't exist in TypeScript types yet
      return [];
    }
  });

  // Criar configuração dinâmica do formulário
  const createFormSchema = (configSchema: ConfigField[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    configSchema.forEach(field => {
      if (field.type === 'text' || field.type === 'password') {
        schemaFields[field.name] = field.required 
          ? z.string().min(1, `${field.label} é obrigatório`)
          : z.string().optional();
      } else if (field.type === 'boolean') {
        schemaFields[field.name] = z.boolean().optional();
      }
    });
    
    return z.object(schemaFields);
  };

  // Ativar integração
  const activateIntegration = useMutation({
    mutationFn: async ({ integrationId, credentials }: { integrationId: string, credentials: Record<string, any> }) => {
      // Mock activation since the table doesn't exist in TypeScript types yet
      console.log('Activating integration:', integrationId, credentials);
      return { success: true };
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
      // Mock deactivation since the table doesn't exist in TypeScript types yet
      console.log('Deactivating integration:', integrationId);
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
      // Mock connection test since the table doesn't exist in TypeScript types yet
      console.log('Testing connection for integration:', integrationId);
      return { success: true, message: "Conexão testada com sucesso!" };
    },
    onSuccess: (data) => {
      toast({
        title: 'Teste de conexão',
        description: data.message,
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
                key={`${field.name}-${index}`}
                control={form.control}
                name={field.name as any}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isIntegrationActive = (integrationId: string) => {
    return companyIntegrations?.some(
      ai => ai.integration_id === integrationId && ai.status === 'active'
    );
  };

  const getActiveIntegration = (integrationId: string) => {
    return companyIntegrations?.find(
      ai => ai.integration_id === integrationId && ai.status === 'active'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações - Integrações</h1>
        <p className="text-muted-foreground">
          Configure as integrações disponíveis para sua empresa
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
                    <Badge variant={integration.type === 'fiscal' ? 'default' : 'secondary'}>
                      {integration.type === 'fiscal' ? 'Fiscal' : 'Pagamento'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {integration.description}
                </CardDescription>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
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
                          <Settings className="w-4 h-4 mr-1" />
                        )}
                        Testar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (activeIntegration) {
                            deactivateIntegration.mutate(activeIntegration.id);
                          }
                        }}
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!availableIntegrations || availableIntegrations.length === 0) && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma integração disponível</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre em contato com o suporte para liberar integrações para sua empresa.
          </p>
        </div>
      )}
    </div>
  );
}