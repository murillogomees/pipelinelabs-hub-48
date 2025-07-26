
import React, { useState, useEffect } from 'react';
import { UserFormData, User } from './types';
import { BasicInfoFields } from './components/BasicInfoFields';
import { CompanySelector } from './components/CompanySelector';
import { AccessLevelSelector } from './components/AccessLevelSelector';
import { PasswordField } from './components/PasswordField';
import { PermissionsSection } from './components/PermissionsSection';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useQuery } from '@tanstack/react-query';

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
  access_level_id: '',
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
  const [showDowngradeAlert, setShowDowngradeAlert] = useState(false);
  const [pendingAccessLevel, setPendingAccessLevel] = useState<string | null>(null);
  const { isSuperAdmin, isContratante } = usePermissions();

  // Buscar níveis de acesso para mapear permissões
  const { data: accessLevels = [] } = useQuery({
    queryKey: ['access-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_levels')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  // Carregar empresa padrão
  useEffect(() => {
    const loadDefaultCompany = async () => {
      try {
        const { data } = await supabase.rpc('get_default_company_id');
        if (data) {
          setDefaultCompanyId(String(data));
        } else {
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
        access_level_id: userCompany?.access_level_id || '',
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
      setFormData({
        ...defaultFormData,
        company_id: defaultCompanyId
      });
    }
  }, [user, defaultCompanyId]);

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccessLevelChange = (accessLevelId: string) => {
    const selectedLevel = accessLevels.find(level => level.id === accessLevelId);
    const currentLevel = accessLevels.find(level => level.id === formData.access_level_id);
    
    if (user && currentLevel && selectedLevel) {
      // Verificar se é downgrade (de super_admin para outro ou de contratante para operador)
      const isDowngrade = (
        (currentLevel.name === 'super_admin' && selectedLevel.name !== 'super_admin') ||
        (currentLevel.name === 'contratante' && selectedLevel.name === 'operador')
      );
      
      if (isDowngrade) {
        setPendingAccessLevel(accessLevelId);
        setShowDowngradeAlert(true);
        return;
      }
    }
    
    // Aplicar mudança diretamente
    if (selectedLevel) {
      setFormData(prev => ({
        ...prev,
        access_level_id: accessLevelId,
        user_type: selectedLevel.name as 'contratante' | 'operador',
        permissions: selectedLevel.permissions || prev.permissions
      }));
    }
  };

  const confirmDowngrade = () => {
    if (pendingAccessLevel) {
      const selectedLevel = accessLevels.find(level => level.id === pendingAccessLevel);
      if (selectedLevel) {
        setFormData(prev => ({
          ...prev,
          access_level_id: pendingAccessLevel,
          user_type: selectedLevel.name as 'contratante' | 'operador',
          permissions: selectedLevel.permissions || prev.permissions
        }));
      }
      setPendingAccessLevel(null);
    }
    setShowDowngradeAlert(false);
  };

  const cancelDowngrade = () => {
    setPendingAccessLevel(null);
    setShowDowngradeAlert(false);
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

      <AccessLevelSelector
        value={formData.access_level_id}
        onChange={handleAccessLevelChange}
        disabled={!!user && user.user_companies?.[0]?.user_type === 'super_admin'}
      />

      <PasswordField
        value={formData.password}
        onChange={(value) => handleFieldChange('password', value)}
        isEditing={!!user}
      />

      {(isSuperAdmin || isContratante) && (
        <PermissionsSection
          permissions={formData.permissions}
          onPermissionChange={handlePermissionChange}
          userType={formData.user_type}
        />
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </button>
      </div>

      <AlertDialog open={showDowngradeAlert} onOpenChange={setShowDowngradeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alteração de Nível</AlertDialogTitle>
            <AlertDialogDescription>
              Você está alterando para um nível de acesso com menos privilégios. Isso reduzirá as permissões do usuário.
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDowngrade}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDowngrade}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
