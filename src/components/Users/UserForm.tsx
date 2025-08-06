import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { User, Company, AccessLevel } from '@/hooks/useUsersQuery';
import { Eye, EyeOff } from 'lucide-react';

interface UserFormProps {
  user: User | null; // null = creating new user
  companies: Company[];
  accessLevels: AccessLevel[];
  onSubmit: (userData: any) => Promise<void>;
  onCancel: () => void;
  isSuperAdmin: boolean;
}

export function UserForm({ 
  user, 
  companies, 
  accessLevels, 
  onSubmit, 
  onCancel, 
  isSuperAdmin 
}: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    document: '',
    phone: '',
    company_id: '',
    role: 'operador',
    access_level_id: '',
    is_active: true
  });

  const { data: currentCompany } = useCurrentCompany();

  // Populate form data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // Never pre-populate password
        display_name: user.display_name || '',
        document: user.document || '',
        phone: user.phone || '',
        company_id: user.company_id || '',
        role: user.role || 'operador',
        access_level_id: user.access_level_id || '',
        is_active: user.is_active
      });
    } else if (!isSuperAdmin && currentCompany?.company_id) {
      // Set default company for non-super-admin users
      setFormData(prev => ({
        ...prev,
        company_id: currentCompany.company_id
      }));
    }
  }, [user, isSuperAdmin, currentCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.email || !formData.display_name) {
        throw new Error('Email e nome são obrigatórios');
      }

      if (!user && !formData.password) {
        throw new Error('Senha é obrigatória para novo usuário');
      }

      if (!formData.access_level_id) {
        throw new Error('Nível de acesso é obrigatório');
      }

      // For non-super-admin users, ensure they're only managing their company
      if (!isSuperAdmin && currentCompany?.company_id) {
        formData.company_id = currentCompany.company_id;
      }

      const dataToSubmit = { ...formData };
      
      // Remove password from update operations
      if (user) {
        delete dataToSubmit.password;
      }

      await onSubmit(dataToSubmit);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      throw error; // Let parent handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter access levels based on user permissions
  const filteredAccessLevels = accessLevels.filter(level => {
    if (isSuperAdmin) return true; // Super admin can assign any level
    return level.name !== 'super_admin'; // Non-super-admin cannot assign super_admin
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!!user} // Can't change email of existing user
            required
          />
        </div>

        {/* Password (only for new users) */}
        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display_name">Nome Completo *</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => handleInputChange('display_name', e.target.value)}
            required
          />
        </div>

        {/* Document */}
        <div className="space-y-2">
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            id="document"
            value={formData.document}
            onChange={(e) => handleInputChange('document', e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        {/* Company (only for super admin) */}
        {isSuperAdmin && (
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select 
              value={formData.company_id} 
              onValueChange={(value) => handleInputChange('company_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role */}
        <div className="space-y-2">
          <Label>Tipo de Usuário</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => handleInputChange('role', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isSuperAdmin && (
                <SelectItem value="super_admin">Super Administrador</SelectItem>
              )}
              <SelectItem value="contratante">Contratante</SelectItem>
              <SelectItem value="operador">Operador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Access Level */}
        <div className="space-y-2">
          <Label>Nível de Acesso *</Label>
          <Select 
            value={formData.access_level_id} 
            onValueChange={(value) => handleInputChange('access_level_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o nível de acesso" />
            </SelectTrigger>
            <SelectContent>
              {filteredAccessLevels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Status */}
      {user && (
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Usuário ativo</Label>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}