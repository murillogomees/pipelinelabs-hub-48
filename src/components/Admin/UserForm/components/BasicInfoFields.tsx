
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Activity } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface BasicInfoFieldsProps {
  formData: {
    display_name: string;
    email: string;
    user_type: string;
    is_active: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  isEditing?: boolean;
  userType: 'super_admin' | 'contratante' | 'operador';
  onUserTypeChange: (userType: 'super_admin' | 'contratante' | 'operador') => void;
  errors?: Partial<{ display_name: string; email: string; }>;
}

export function BasicInfoFields({ 
  formData, 
  onChange, 
  isEditing = false,
  userType,
  onUserTypeChange,
  errors = {}
}: BasicInfoFieldsProps) {
  const { isSuperAdmin, isContratante } = usePermissions();
  
  // Determinar tipos disponíveis baseado nas permissões
  const getAvailableUserTypes = () => {
    if (isSuperAdmin) {
      return [
        { value: "operador", label: "Operador", description: "Acesso limitado às funcionalidades" },
        { value: "contratante", label: "Contratante", description: "Acesso completo à empresa" },
        { value: "super_admin", label: "Administrador", description: "Acesso total ao sistema", disabled: true }
      ];
    }
    
    if (isContratante) {
      return [
        { value: "operador", label: "Operador", description: "Acesso limitado às funcionalidades" },
        { value: "contratante", label: "Contratante", description: "Acesso completo à empresa" }
      ];
    }
    
    return [
      { value: "operador", label: "Operador", description: "Acesso limitado às funcionalidades" }
    ];
  };

  const availableTypes = getAvailableUserTypes();

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Informações Básicas</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="display_name" className="text-sm font-medium">Nome Completo</Label>
            </div>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => onChange('display_name', e.target.value)}
              placeholder="Nome completo do usuário"
              className={`h-11 ${errors.display_name ? 'border-red-500' : ''}`}
              required
            />
            {errors.display_name && (
              <p className="text-sm text-red-600">{errors.display_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              {isEditing && (
                <span className="text-xs text-muted-foreground">(não editável)</span>
              )}
            </div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="usuario@empresa.com"
              className={`h-11 ${errors.email ? 'border-red-500' : ''}`}
              required
              disabled={isEditing}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="user_type" className="text-sm font-medium">Tipo de Usuário</Label>
          </div>
          <SearchableSelect
            value={userType}
            onValueChange={onUserTypeChange}
            placeholder="Selecione o tipo de usuário..."
            searchPlaceholder="Buscar tipo..."
            staticOptions={availableTypes.map(type => ({
              value: type.value,
              label: type.label,
              disabled: type.disabled
            }))}
            emptyMessage="Nenhum tipo encontrado"
            className="h-11"
          />
          {userType && (
            <p className="text-xs text-muted-foreground mt-1">
              {availableTypes.find(type => type.value === userType)?.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
          <div className="flex items-center space-x-3">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                Status do Usuário
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.is_active ? 'Usuário ativo no sistema' : 'Usuário inativo no sistema'}
              </p>
            </div>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => onChange('is_active', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
