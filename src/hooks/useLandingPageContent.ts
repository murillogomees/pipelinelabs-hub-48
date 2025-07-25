import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LandingPageSection {
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
  created_at: string;
  updated_at: string;
}

export function useLandingPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections, isLoading } = useQuery({
    queryKey: ['landing-page-content'],
    queryFn: async (): Promise<LandingPageSection[]> => {
      const { data, error } = await supabase
        .from('landing_page_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching landing page content:', error);
        throw error;
      }

      return data || [];
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LandingPageSection> }) => {
      const { data, error } = await supabase
        .from('landing_page_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-content'] });
      toast({
        title: "Seção atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating landing page content:', error);
      toast({
        title: "Erro ao salvar",
        description: "Houve um erro ao salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async (newSection: Omit<LandingPageSection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('landing_page_content')
        .insert([newSection])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-content'] });
      toast({
        title: "Seção criada",
        description: "Nova seção adicionada com sucesso.",
      });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('landing_page_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-content'] });
      toast({
        title: "Seção removida",
        description: "Seção removida com sucesso.",
      });
    },
  });

  // Helper function to get a specific section by key
  const getSection = (key: string): LandingPageSection | undefined => {
    return sections?.find(section => section.section_key === key);
  };

  return {
    sections: sections || [],
    isLoading,
    updateSection: updateSectionMutation.mutate,
    createSection: createSectionMutation.mutate,
    deleteSection: deleteSectionMutation.mutate,
    isUpdating: updateSectionMutation.isPending,
    isCreating: createSectionMutation.isPending,
    isDeleting: deleteSectionMutation.isPending,
    getSection,
  };
}