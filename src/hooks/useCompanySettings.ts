import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type CompanySettings = Tables<'company_settings'>;

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const { data: userCompany } = await supabase.rpc('get_user_company_id');
        if (userCompany) {
          const { data: newSettings, error: insertError } = await supabase
            .from('company_settings')
            .insert({
              company_id: userCompany,
              moeda: 'BRL',
              idioma: 'pt-BR',
              timezone: 'America/Sao_Paulo',
              formas_pagamento_ativas: ['pix', 'cartao', 'boleto'],
              funcionalidades_ativas: {},
              impostos_padrao: {},
              notificacoes: { email: true, whatsapp: false },
              branding: { nome_sistema: 'Pipeline Labs' }
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', settings?.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refreshSettings: fetchSettings
  };
}