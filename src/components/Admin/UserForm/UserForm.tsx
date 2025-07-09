import React, { useState, useEffect } from 'react';
import { UserFormData, User } from './types';
import { BasicInfoFields } from './components/BasicInfoFields';
import { CompanySelector } from './components/CompanySelector';
import { PasswordField } from './components/PasswordField';
import { PermissionsSection } from './components/PermissionsSection';
import { supabase } from '@/integrations/supabase/client';

interface UserFormProps {
  user?: User;
  onSubmit: (formData: UserFormData) => void;
  loading: boolean;
}

const defaultFormData: UserFormData = {
  display_name: '',
  email: '',
  phone: '',
  is_active: true,
  role: 'user',
  password: '',
  company_id: '',
  permissions: {
    dashboard: true,
    vendas: true,
    produtos: true,
    clientes: true,
    financeiro: true,
    notas_fiscais: true,
    producao: false,
    admin: false
  }
};

export function UserForm({ user, onSubmit, loading }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [defaultCompanyId, setDefaultCompanyId] = useState('');

  // Carregar empresa padrão
  useEffect(() => {
    const loadDefaultCompany = async () => {
      try {
        const { data } = await supabase.rpc('get_default_company_id');
        if (data) {
          setDefaultCompanyId(data);
        } else {
          // Fallback: buscar Pipeline Labs diretamente
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('name', 'Pipeline Labs')
            .single();
          
          if (company) {
            setDefaultCompanyId(company.id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar empresa padrão:', error);
      }
    };
    loadDefaultCompany();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        phone: user.phone || '',
        is_active: user.is_active,
        role: user.user_companies[0]?.role || 'user',
        password: '',
        company_id: user.user_companies[0]?.company_id || '',
        permissions: {
          dashboard: true,
          vendas: true,
          produtos: true,
          clientes: true,
          financeiro: true,
          notas_fiscais: true,
          producao: false,
          admin: false,
          ...user.user_companies[0]?.permissions
        }
      });
    } else if (defaultCompanyId) {
      // Só definir o formulário padrão quando temos o ID da empresa
      setFormData({
        ...defaultFormData,
        company_id: defaultCompanyId // Definir Pipeline Labs como padrão
      });
    }
  }, [user, defaultCompanyId]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BasicInfoFields 
        formData={formData}
        onChange={handleFieldChange}
        isEditing={!!user}
      />

      <CompanySelector
        value={formData.company_id}
        onChange={(value) => handleFieldChange('company_id', value)}
        disabled={!!user}
        isRequired={!user}
      />

      <PasswordField
        value={formData.password}
        onChange={(value) => handleFieldChange('password', value)}
        isEditing={!!user}
      />

      <PermissionsSection
        permissions={formData.permissions}
        onPermissionChange={handlePermissionChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}