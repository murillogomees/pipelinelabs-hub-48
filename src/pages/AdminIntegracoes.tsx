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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

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
  available_for_plans: string[] | null;
  created_at: string;
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

const integrationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  visible_to_companies: z.boolean(),
  config_fields: z.array(z.object({
    field: z.string().min(1, 'Campo é obrigatório'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    label: z.string().min(1, 'Label é obrigatório'),
    required: z.boolean()
  }))
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

export function AdminIntegracoes() {
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{open: boolean, integration?: IntegrationAvailable}>({open: false});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as integrações (admin)
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['admin-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_available')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Criar nova integração
  const createIntegration = useMutation({
    mutationFn: async (formData: IntegrationFormData) => {
      const configSchema = formData.config_fields.map(field => ({
        field: field.field,
        type: field.type,
        label: field.label,
        required: field.required
      }));

      const { data, error } = await supabase
        .from('integrations_available')
        .insert({
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          config_schema: configSchema,
          visible_to_companies: formData.visible_to_companies
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      setCreateDialog(false);
      toast({
        title: 'Integração criada',
        description: 'A integração foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Atualizar integração
  const updateIntegration = useMutation({
    mutationFn: async ({ id, formData }: { id: string, formData: IntegrationFormData }) => {
      const configSchema = formData.config_fields.map(field => ({
        field: field.field,
        type: field.type,
        label: field.label,
        required: field.required
      }));

      const { data, error } = await supabase
        .from('integrations_available')
        .update({
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          config_schema: configSchema,
          visible_to_companies: formData.visible_to_companies
        })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      setEditDialog({open: false});
      toast({
        title: 'Integração atualizada',
        description: 'A integração foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Deletar integração
  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integrations_available')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      toast({
        title: 'Integração removida',
        description: 'A integração foi removida com sucesso.',
      });
    }
  });

  const IntegrationDialog = ({ 
    open, 
    onOpenChange, 
    integration, 
    mode 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    integration?: IntegrationAvailable;
    mode: 'create' | 'edit';
  }) => {
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

    const form = useForm<IntegrationFormData>({
      resolver: zodResolver(integrationSchema),
      defaultValues: {
        name: integration?.name || '',
        type: integration?.type || '',
        description: integration?.description || '',
        logo_url: integration?.logo_url || '',
        visible_to_companies: integration?.visible_to_companies ?? false,
        config_fields: integration ? parseConfigSchema(integration.config_schema) : [
          { field: '', type: 'text', label: '', required: false }
        ]
      }
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: 'config_fields'
    });

    const onSubmit = (values: IntegrationFormData) => {
      if (mode === 'create') {
        createIntegration.mutate(values);
      } else if (integration) {
        updateIntegration.mutate({ id: integration.id, formData: values });
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Criar Nova Integração' : 'Editar Integração'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes e campos necessários para a integração.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mercado Livre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="logistica">Logística</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="comunicacao">Comunicação</SelectItem>
                          <SelectItem value="contabilidade">Contabilidade</SelectItem>
                          <SelectItem value="personalizada">Personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o que esta integração faz..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input 
                        type="url" 
                        placeholder="https://exemplo.com/logo.png" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visible_to_companies"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Visível para empresas</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Permitir que empresas vejam e ativem esta integração
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Campos de Configuração</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ field: '', type: 'text', label: '', required: false })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Campo
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`config_fields.${index}.field`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campo</FormLabel>
                            <FormControl>
                              <Input placeholder="api_key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`config_fields.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="password">Senha</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name={`config_fields.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input placeholder="API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`config_fields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Obrigatório</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createIntegration.isPending || updateIntegration.isPending}
                >
                  {(createIntegration.isPending || updateIntegration.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === 'create' ? 'Criar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Integrações</h1>
          <p className="text-muted-foreground">
            Configure as integrações disponíveis para as empresas
          </p>
        </div>
        
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <IntegrationDialog 
            open={createDialog} 
            onOpenChange={setCreateDialog} 
            mode="create" 
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations?.map((integration) => (
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
                  <div className={`w-2 h-2 rounded-full ${integration.visible_to_companies ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm font-medium">
                    {integration.visible_to_companies ? 'Visível' : 'Oculto'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Dialog 
                    open={editDialog.open && editDialog.integration?.id === integration.id}
                    onOpenChange={(open) => setEditDialog({open, integration: open ? integration : undefined})}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <IntegrationDialog 
                      open={editDialog.open && editDialog.integration?.id === integration.id}
                      onOpenChange={(open) => setEditDialog({open, integration: open ? integration : undefined})}
                      integration={integration}
                      mode="edit"
                    />
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja remover esta integração?')) {
                        deleteIntegration.mutate(integration.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!integrations || integrations.length === 0) && (
        <div className="text-center py-12">
          <ExternalLink className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma integração criada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece criando sua primeira integração.
          </p>
        </div>
      )}
    </div>
  );
}