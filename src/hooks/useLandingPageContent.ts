
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Mock data since the table doesn't exist in current schema
  const { data: sections, isLoading } = useQuery({
    queryKey: ['landing-page-content'],
    queryFn: async (): Promise<LandingPageSection[]> => {
      // Mock landing page sections
      return [
        {
          id: '1',
          section_key: 'hero',
          title: 'Pipeline Labs',
          subtitle: 'Sistema completo de gestão',
          description: 'ERP inteligente para pequenos empreendedores',
          image_url: null,
          link_url: null,
          button_text: 'Começar agora',
          content_data: {},
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LandingPageSection> }) => {
      // Mock update
      console.log('Updating landing page section:', id, updates);
      return { id, ...updates };
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
      // Mock create
      console.log('Creating landing page section:', newSection);
      return {
        id: 'new_section_id',
        ...newSection,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
      // Mock delete
      console.log('Deleting landing page section:', id);
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
