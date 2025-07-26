
import React, { useState, useEffect } from 'react';
import { useUserManagement } from './hooks/useUserManagement';
import { BasicInfoFields } from './components/BasicInfoFields';
import { CompanySelector } from './components/CompanySelector';
import { AccessLevelSelector } from './components/AccessLevelSelector';
import { PermissionsSection } from './components/PermissionsSection';
import { PasswordField } from './components/PasswordField';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { UserFormData, User } from './types';

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultPermissions = {
  dashboard: true,
  vendas: true,
  produtos: true,
  clientes: true,
  compras: true,
  estoque: true,
  financeiro: false,
  notas_fiscais: false,
  producao: true,
  contratos: false,
  relatorios: true,
  analytics: false,
  marketplace_canais: false,
  integracoes: false,
  configuracoes: false,
};

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const {
    companies,
    accessLevels,
    isLoadingCompanies,
    isLoadingAccessLevels,
  } = useUserManagement();

  const [formData, setFormData] = useState<UserFormData>(() => {
    if (user && user.user_companies.length > 0) {
      const userCompany = user.user_companies[0];
      return {
        display_name: user.display_name,
        email: user.email,
        is_active: user.is_active,
        user_type: userCompany.user_type,
        access_level_id: userCompany.access_level_id || '',
        company_id: userCompany.company_id,
        permissions: userCompany.permissions as UserFormData['permissions'] || defaultPermissions,
      };
    }

    return {
      display_name: '',
      email: '',
      is_active: true,
      user_type: 'operador',
      access_level_id: '',
      company_id: '',
      permissions: defaultPermissions,
    };
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [showAccessLevelAlert, setShowAccessLevelAlert] = useState(false);

  useEffect(() => {
    if (companies.length > 0 && !formData.company_id && !user) {
      setFormData(prev => ({
        ...prev,
        company_id: companies[0].id,
      }));
    }
  }, [companies, formData.company_id, user]);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Empresa é obrigatória';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle access level change
  const handleAccessLevelChange = (accessLevelId: string) => {
    const selectedLevel = accessLevels.find(level => level.id === accessLevelId);
    
    if (selectedLevel) {
      // Check if changing from a higher level to a lower one
      const currentLevel = accessLevels.find(level => level.id === formData.access_level_id);
      const isDowngrade = currentLevel && 
        ((currentLevel.name === 'super_admin' && selectedLevel.name !== 'super_admin') ||
         (currentLevel.name === 'contratante' && selectedLevel.name === 'operador'));
      
      if (isDowngrade) {
        setShowAccessLevelAlert(true);
      }

      // Map access level to user type for non-super_admin levels
      let userType: 'contratante' | 'operador' | 'super_admin' = 'operador';
      if (selectedLevel.name === 'contratante') {
        userType = 'contratante';
      } else if (selectedLevel.name === 'operador') {
        userType = 'operador';
      } else if (selectedLevel.name === 'super_admin') {
        userType = 'super_admin';
      }

      const newPermissions = {
        ...defaultPermissions,
        ...(selectedLevel.permissions || {}),
      };

      setFormData(prev => ({
        ...prev,
        access_level_id: accessLevelId,
        user_type: userType,
        permissions: newPermissions,
      }));
    }
  };

  // Handle user type change (for super_admin only)
  const handleUserTypeChange = (userType: 'super_admin' | 'contratante' | 'operador') => {
    // For super_admin, clear access level since they don't use it
    if (userType === 'super_admin') {
      setFormData(prev => ({
        ...prev,
        user_type: userType,
        access_level_id: '',
        permissions: {
          dashboard: true,
          vendas: true,
          produtos: true,
          clientes: true,
          compras: true,
          estoque: true,
          financeiro: true,
          notas_fiscais: true,
          producao: true,
          contratos: true,
          relatorios: true,
          analytics: true,
          marketplace_canais: true,
          integracoes: true,
          configuracoes: true,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        user_type: userType,
      }));
    }
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoadingCompanies || isLoadingAccessLevels) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {showAccessLevelAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Atenção: Você está diminuindo o nível de acesso deste usuário. 
            Isso pode restringir suas permissões atuais.
          </AlertDescription>
        </Alert>
      )}

      <BasicInfoFields
        formData={formData}
        onChange={handleFieldChange}
        isEditing={!!user}
        userType={formData.user_type}
        onUserTypeChange={handleUserTypeChange}
        errors={errors}
      />

      <CompanySelector
        value={formData.company_id}
        onChange={(company_id) => setFormData(prev => ({ ...prev, company_id }))}
        disabled={false}
        isRequired={true}
        error={errors.company_id}
      />

      {formData.user_type !== 'super_admin' && (
        <AccessLevelSelector
          value={formData.access_level_id}
          onChange={handleAccessLevelChange}
          disabled={false}
          isRequired={true}
          userType={formData.user_type}
        />
      )}

      {/* Only show PermissionsSection for non-super_admin users */}
      {formData.user_type !== 'super_admin' && (
        <PermissionsSection
          permissions={formData.permissions}
          onPermissionChange={(permission: string, value: boolean) => {
            setFormData(prev => ({
              ...prev,
              permissions: {
                ...prev.permissions,
                [permission]: value,
              },
            }));
          }}
          userType={formData.user_type as 'contratante' | 'operador'}
          disabled={false}
        />
      )}

      {!user && (
        <PasswordField
          value={formData.password || ''}
          onChange={(password) => setFormData(prev => ({ ...prev, password }))}
          isEditing={false}
          error={errors.password}
        />
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {user ? 'Atualizar' : 'Criar'} Usuário
        </Button>
      </div>
    </form>
  );
}
