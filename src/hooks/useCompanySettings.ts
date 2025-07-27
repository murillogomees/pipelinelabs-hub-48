
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';

interface CompanySettings {
  id: string;
  company_id: string;
  theme: string;
  language: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  fiscal_year_start: string;
  default_tax_rate: number;
  settings: any;
  created_at: string;
  updated_at: string;
}

export function useCompanySettings() {
  const { user } = useAuth();
  const { isContratante, isSuperAdmin } = usePermissions();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Buscar configurações da primeira empresa disponível
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      if (companiesError || !companiesData?.[0]) {
        console.error('Erro ao buscar empresa:', companiesError);
        return;
      }

      const companyId = companiesData[0].id;

      const { data: settingsData, error: settingsError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', settingsError);
        return;
      }

      setSettings(settingsData);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    if (!settings || (!isContratante && !isSuperAdmin)) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('company_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        return false;
      }

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar configurações:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user?.id]);

  return {
    settings,
    isLoading,
    updateSettings,
    refetch: fetchSettings,
    canEdit: isContratante || isSuperAdmin
  };
}
