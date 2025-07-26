
import React, { useCallback, useMemo } from 'react';
import { BaseDialog, useDialog } from '@/components/Base/BaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings, Activity } from 'lucide-react';
import { useBaseForm } from '@/hooks/useBaseForm';
import type { AccessLevel } from './types';

interface AccessLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessLevel?: AccessLevel;
  onSave: () => void;
}

const permissionCategories = [
  {
    name: 'Geral',
    permissions: [
      { key: 'dashboard', label: 'Dashboard', description: 'Visualizar painéis e estatísticas' }
    ]
  },
  {
    name: 'Comercial',
    permissions: [
      { key: 'vendas', label: 'Vendas', description: 'Gerenciar vendas e PDV' },
      { key: 'produtos', label: 'Produtos', description: 'Cadastrar e gerenciar produtos' },
      { key: 'clientes', label: 'Clientes', description: 'Gerenciar base de clientes' },
      { key: 'compras', label: 'Compras', description: 'Gerenciar compras e fornecedores' }
    ]
  },
  {
    name: 'Operacional',
    permissions: [
      { key: 'estoque', label: 'Estoque', description: 'Controle de estoque e movimentações' },
      { key: 'producao', label: 'Produção', description: 'Ordens de produção e serviços' }
    ]
  },
  {
    name: 'Financeiro',
    permissions: [
      { key: 'financeiro', label: 'Financeiro', description: 'Controle financeiro e relatórios' }
    ]
  },
  {
    name: 'Fiscal',
    permissions: [
      { key: 'notas_fiscais', label: 'Notas Fiscais', description: 'Emissão de NFe, NFSe e NFCe' }
    ]
  },
  {
    name: 'Jurídico',
    permissions: [
      { key: 'contratos', label: 'Contratos', description: 'Gestão de contratos' }
    ]
  },
  {
    name: 'Relatórios',
    permissions: [
      { key: 'relatorios', label: 'Relatórios', description: 'Visualizar e gerar relatórios' },
      { key: 'analytics', label: 'Analytics', description: 'Análises avançadas e métricas' }
    ]
  },
  {
    name: 'Integrações',
    permissions: [
      { key: 'marketplace_canais', label: 'Marketplace Canais', description: 'Integração com marketplaces' },
      { key: 'integracoes', label: 'Integrações', description: 'Configurar integrações externas' }
    ]
  },
  {
    name: 'Sistema',
    permissions: [
      { key: 'configuracoes', label: 'Configurações', description: 'Configurações gerais do sistema' }
    ]
  },
  {
    name: 'Administrativo',
    permissions: [
      { key: 'admin_panel', label: 'Painel Admin', description: 'Acesso ao painel administrativo' },
      { key: 'user_management', label: 'Gestão de Usuários', description: 'Gerenciar usuários' },
      { key: 'company_management', label: 'Gestão de Empresas', description: 'Gerenciar empresas' },
      { key: 'system_settings', label: 'Configurações do Sistema', description: 'Configurações avançadas do sistema' }
    ]
  }
];

type FormData = {
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  permissions: Record<string, boolean>;
};

export function AccessLevelDialog({ open, onOpenChange, accessLevel, onSave }: AccessLevelDialogProps) {
  const { toast } = useToast();

  const defaultValues = useMemo<FormData>(() => ({
    name: accessLevel?.name || '',
    display_name: accessLevel?.display_name || '',
    description: accessLevel?.description || '',
    is_active: accessLevel?.is_active ?? true,
    permissions: accessLevel?.permissions || {}
  }), [accessLevel]);

  const handleSubmitData = useCallback(async (data: FormData) => {
    const submitData = {
      ...data,
      name: data.name.toLowerCase().replace(/\s+/g, '_')
    };

    if (accessLevel) {
      const { error } = await supabase
        .from('access_levels')
        .update(submitData)
        .eq('id', accessLevel.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('access_levels')
        .insert([submitData]);

      if (error) throw error;
    }

    onSave();
    onOpenChange(false);
  }, [accessLevel, onSave, onOpenChange]);

  const { form, handleSubmit, isSubmitting } = useBaseForm<FormData>({
    defaultValues,
    onSubmit: handleSubmitData,
    successMessage: `Nível de acesso ${accessLevel ? 'atualizado' : 'criado'} com sucesso`,
    errorMessage: `Falha ao ${accessLevel ? 'atualizar' : 'criar'} nível de acesso`,
    resetOnSuccess: false
  });

  const { watch, setValue } = form;
  const formData = watch();

  const handlePermissionChange = useCallback((permission: string, value: boolean) => {
    const currentPermissions = formData.permissions || {};
    setValue('permissions', {
      ...currentPermissions,
      [permission]: value
    });
  }, [setValue, formData.permissions]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string | boolean) => {
    if (field === 'display_name' && typeof value === 'string') {
      setValue('display_name', value);
      setValue('name', value.toLowerCase().replace(/\s+/g, '_'));
    } else {
      setValue(field, value);
    }
  }, [setValue]);

  const enabledPermissions = useMemo(() => 
    Object.values(formData.permissions || {}).filter(Boolean).length
  , [formData.permissions]);

  const totalPermissions = useMemo(() => 
    permissionCategories.reduce((acc, cat) => acc + cat.permissions.length, 0)
  , []);

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={accessLevel ? 'Editar Nível de Acesso' : 'Novo Nível de Acesso'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleFieldChange('display_name', e.target.value)}
              placeholder="Ex: Administrador da Empresa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Interno</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="Ex: admin_empresa"
              disabled={accessLevel?.is_system}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Descreva as responsabilidades deste nível de acesso"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
          />
          <Label>Nível de acesso ativo</Label>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Permissões de Acesso</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  Configure os módulos e funcionalidades que este nível pode acessar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {permissionCategories.map((category) => {
              const categoryPermissions = category.permissions.filter(p => formData.permissions?.[p.key]);
              
              return (
                <div key={category.name} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                      >
                        {category.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {categoryPermissions.length} de {category.permissions.length} habilitados
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {category.permissions.map((permission) => {
                      const isEnabled = formData.permissions?.[permission.key] || false;
                      
                      return (
                        <div
                          key={permission.key}
                          className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isEnabled 
                              ? 'bg-primary/5 border-primary/20 shadow-sm hover:shadow-md' 
                              : 'bg-card hover:bg-muted/30 border-border hover:border-border/80'
                          }`}
                          onClick={() => handlePermissionChange(permission.key, !isEnabled)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              isEnabled 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                            }`}>
                              <Settings className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-sm font-medium cursor-pointer leading-none">
                                  {permission.label}
                                </Label>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                  className="data-[state=checked]:bg-primary scale-90"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>
                  Total: <strong>{enabledPermissions}</strong> de{' '}
                  <strong>{totalPermissions}</strong> funcionalidades habilitadas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : accessLevel ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}
