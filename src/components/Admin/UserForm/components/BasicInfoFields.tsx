import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface BasicInfoFieldsProps {
  formData: {
    display_name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  isEditing?: boolean;
}

export function BasicInfoFields({ formData, onChange, isEditing = false }: BasicInfoFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Nome Completo</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => onChange('display_name', e.target.value)}
            placeholder="Nome completo do usuário"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="email@exemplo.com"
            required
            disabled={isEditing} // Não permitir alterar email de usuário existente
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Cargo</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => onChange('role', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => onChange('is_active', checked)}
        />
        <Label htmlFor="is_active">Usuário ativo</Label>
      </div>
    </>
  );
}