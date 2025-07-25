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
  is_active: true,
  user_type: 'operador',
  password: '',
  company_id: '',
  permissions: {
    dashboard: true,
    vendas: false,
    produtos: false,
    clientes: false,
    compras: false,
    estoque: false,
    financeiro: false,
    notas_fiscais: false,
    producao: false,
    contratos: false,
    relatorios: false,
    analytics: false,
    marketplace_canais: false,
    integracoes: false,
    configuracoes: false,
  },
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
          setDefaultCompanyId(String(data));
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
        // Error loading default company
      }
    };
    loadDefaultCompany();
  }, []);

  useEffect(() => {
    if (user) {
      const userCompany = user.user_companies && user.user_companies.length > 0 
        ? user.user_companies[0] 
        : null;
        
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        is_active: user.is_active,
        user_type: userCompany?.user_type || 'operador',
        password: '',
        company_id: userCompany?.company_id || '',
        permissions: {
          dashboard: true,
          vendas: false,
          produtos: false,
          clientes: false,
          compras: false,
          estoque: false,
          financeiro: false,
          notas_fiscais: false,
          producao: false,
          contratos: false,
          relatorios: false,
          analytics: false,
          marketplace_canais: false,
          integracoes: false,
          configuracoes: false,
          ...(userCompany?.permissions || {})
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