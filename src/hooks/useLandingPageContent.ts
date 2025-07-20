import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface LandingPageContent {
  id: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  button_text?: string;
  content_data: any;
  is_active: boolean;
  display_order: number;
}

export interface LandingPageSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
}

export const useLandingPageContent = () => {
  const [content, setContent] = useState<LandingPageContent[]>([]);
  const [settings, setSettings] = useState<LandingPageSettings[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landing_page_content')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdo da landing page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('*');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateContent = async (id: string, updates: Partial<LandingPageContent>) => {
    try {
      const { error } = await supabase
        .from('landing_page_content')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchContent();
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conteúdo",
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (settingKey: string, value: string) => {
    try {
      const { error } = await supabase
        .from('landing_page_settings')
        .upsert({ setting_key: settingKey, setting_value: value })
        .eq('setting_key', settingKey);

      if (error) throw error;

      await fetchSettings();
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive",
      });
    }
  };

  const getContentBySection = (sectionKey: string) => {
    return content.find(item => item.section_key === sectionKey);
  };

  const getSettingValue = (settingKey: string) => {
    const setting = settings.find(item => item.setting_key === settingKey);
    return setting?.setting_value || '';
  };

  useEffect(() => {
    fetchContent();
    fetchSettings();
  }, []);

  return {
    content,
    settings,
    loading,
    updateContent,
    updateSetting,
    getContentBySection,
    getSettingValue,
    refetch: () => {
      fetchContent();
      fetchSettings();
    }
  };
};