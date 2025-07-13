import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { integrationFormSchema, type IntegrationFormData } from './schema';
import { typeOptions, fieldTypeOptions } from './utils';
import type { IntegrationAvailable } from './types';

interface IntegrationDialogProps {
  mode: 'create' | 'edit';
  integration?: IntegrationAvailable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: IntegrationFormData, id?: string) => void;
  isLoading: boolean;
}

export function IntegrationDialog({
  mode,
  integration,
  open,
  onOpenChange,
  onSubmit,
  isLoading
}: IntegrationDialogProps) {
  const [availablePlans, setAvailablePlans] = useState<Array<{id: string, name: string}>>([]);

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      name: '',
      type: 'api',
      description: '',
      logo_url: '',
      config_fields: [],
      available_for_plans: [],
      visible_to_companies: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'config_fields'
  });

  // Buscar planos disponíveis
  useEffect(() => {
    const fetchPlans = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('plans').select('id, name').eq('active', true);
      if (data) setAvailablePlans(data);
    };
    fetchPlans();
  }, []);

  // Carregar dados da integração no modo edit
  useEffect(() => {
    if (mode === 'edit' && integration) {
      form.reset({
        name: integration.name,
        type: integration.type,
        description: integration.description || '',
        logo_url: integration.logo_url || '',
        config_fields: integration.config_schema || [],
        available_for_plans: integration.available_for_plans || [],
        visible_to_companies: integration.visible_to_companies
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        type: 'api',
        description: '',
        logo_url: '',
        config_fields: [],
        available_for_plans: [],
        visible_to_companies: false
      });
    }
  }, [mode, integration, form]);

  const handleSubmit = (values: IntegrationFormData) => {
    onSubmit(values, mode === 'edit' ? integration?.id : undefined);
  };

  const addConfigField = () => {
    append({
      field: '',
      type: 'text',
      label: '',
      required: false,
      placeholder: '',
      description: ''
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === 'create' ? 'Criar Nova Integração' : 'Editar Integração'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'create' 
            ? 'Configure uma nova integração para disponibilizar às empresas'
            : 'Altere as configurações da integração'
          }
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Integração</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mercado Livre API" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                    placeholder="Descrição da integração e seus benefícios..."
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
                    placeholder="https://exemplo.com/logo.png"
                    type="url"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="available_for_plans"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planos que podem usar</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {availablePlans.map((plan) => {
                      const isSelected = field.value.includes(plan.id);
                      return (
                        <Badge
                          key={plan.id}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = isSelected
                              ? field.value.filter(id => id !== plan.id)
                              : [...field.value, plan.id];
                            field.onChange(newValue);
                          }}
                        >
                          {plan.name}
                        </Badge>
                      );
                    })}
                  </div>
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
                    <div className="text-sm text-muted-foreground">
                      Permite que as empresas vejam e ativem esta integração
                    </div>
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
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campos de Configuração</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addConfigField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Campo {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`config_fields.${index}.field`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Campo</FormLabel>
                          <FormControl>
                            <Input placeholder="api_key" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`config_fields.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fieldTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`config_fields.${index}.placeholder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placeholder</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite sua API key..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`config_fields.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Texto de ajuda..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`config_fields.${index}.required`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Campo obrigatório</FormLabel>
                      </FormItem>
                    )}
                  />
                </Card>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum campo de configuração adicionado.</p>
                  <p className="text-sm">Clique em "Adicionar Campo" para criar campos personalizados.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Criar Integração' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}