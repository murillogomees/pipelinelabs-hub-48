import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { IntegrationFormData } from '../schema';

export const useIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['admin-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_available')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createIntegration = useMutation({
    mutationFn: async (formData: IntegrationFormData) => {
      const configSchema = formData.config_fields.map(field => ({
        field: field.field,
        type: field.type,
        label: field.label,
        required: field.required
      }));

      const { data, error } = await supabase
        .from('integrations_available')
        .insert({
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          config_schema: configSchema,
          visible_to_companies: formData.visible_to_companies
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      toast({
        title: 'Integração criada',
        description: 'A integração foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, formData }: { id: string, formData: IntegrationFormData }) => {
      const configSchema = formData.config_fields.map(field => ({
        field: field.field,
        type: field.type,
        label: field.label,
        required: field.required
      }));

      const { data, error } = await supabase
        .from('integrations_available')
        .update({
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          config_schema: configSchema,
          visible_to_companies: formData.visible_to_companies
        })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      toast({
        title: 'Integração atualizada',
        description: 'A integração foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integrations_available')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-integrations'] });
      toast({
        title: 'Integração removida',
        description: 'A integração foi removida com sucesso.',
      });
    }
  });

  return {
    integrations,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration
  };
};