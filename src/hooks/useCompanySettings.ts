
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { isContratante, isSuperAdmin, currentCompanyId } = usePermissions();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user?.id || !currentCompanyId) return;

    try {
      setIsLoading(true);

      const { data: settingsData, error: settingsError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', currentCompanyId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', settingsError);
        return;
      }

      // Convert company_settings to CompanySettings interface
      if (settingsData) {
        const companySettings: CompanySettings = {
          id: settingsData.id,
          company_id: settingsData.company_id,
          theme: 'light',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          date_format: 'DD/MM/YYYY',
          time_format: '24h',
          fiscal_year_start: '01/01',
          default_tax_rate: 0,
          settings: settingsData || {},
          created_at: settingsData.created_at,
          updated_at: settingsData.updated_at
        };
        setSettings(companySettings);
      }
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
  }, [user?.id, currentCompanyId]);

  return {
    settings,
    isLoading,
    updateSettings,
    refetch: fetchSettings,
    canEdit: isContratante || isSuperAdmin
  };
}
