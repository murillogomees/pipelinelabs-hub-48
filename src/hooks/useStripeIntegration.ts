
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useStripeIntegration(companyId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get company settings with Stripe data
  const { data: stripeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['stripe-settings', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from('company_settings')
        .select('stripe_secret_key, stripe_publishable_key, stripe_webhook_secret, stripe_products')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching Stripe settings:', error);
        return null;
      }

      return {
        secretKey: data?.stripe_secret_key || '',
        publishableKey: data?.stripe_publishable_key || '',
        webhookSecret: data?.stripe_webhook_secret || '',
        products: data?.stripe_products || {}
      };
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false
  });

  // Get plan mappings
  const { data: stripeMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['stripe-mappings', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('stripe_products_mapping')
        .select('id, plan_id, stripe_product_id, stripe_price_id')
        .eq('company_id', companyId);

      if (error) {
        console.error('Error fetching Stripe mappings:', error);
        return [];
      }

      return data;
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false
  });

  // Save Stripe API keys
  const saveStripeSettings = useMutation({
    mutationFn: async (settings: {
      secretKey: string,
      publishableKey: string,
      webhookSecret?: string
    }) => {
      if (!companyId) throw new Error('Company ID is required');

      const { error } = await supabase
        .from('company_settings')
        .update({
          stripe_secret_key: settings.secretKey,
          stripe_publishable_key: settings.publishableKey,
          stripe_webhook_secret: settings.webhookSecret
        })
        .eq('company_id', companyId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-settings', companyId] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do Stripe foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Sync Stripe products
  const syncStripeProducts = async () => {
    if (!stripeSettings?.secretKey) {
      toast({
        title: 'Chave API não configurada',
        description: 'Configure a chave secreta do Stripe antes de sincronizar os produtos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the edge function to sync products
      const response = await fetch(
        'https://ycqinuwrlhuxotypqlfh.supabase.co/functions/v1/sync-stripe-products', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession()}`
          },
          body: JSON.stringify({ stripe_secret_key: stripeSettings.secretKey })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao sincronizar produtos');
      }

      const data = await response.json();
      
      // Update company settings with products
      const { error } = await supabase
        .from('company_settings')
        .update({
          stripe_products: data.products
        })
        .eq('company_id', companyId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['stripe-settings', companyId] });
      
      toast({
        title: 'Produtos sincronizados',
        description: `${data.products_synced} produtos sincronizados com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error syncing Stripe products:', error);
      toast({
        title: 'Erro ao sincronizar produtos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update plan mapping
  const savePlanMapping = useMutation({
    mutationFn: async (mapping: {
      planId: string,
      stripeProductId: string,
      stripePriceId: string
    }) => {
      if (!companyId) throw new Error('Company ID is required');

      // Check if mapping already exists
      const { data: existingMapping } = await supabase
        .from('stripe_products_mapping')
        .select('id')
        .eq('company_id', companyId)
        .eq('plan_id', mapping.planId)
        .maybeSingle();

      if (existingMapping) {
        // Update existing mapping
        const { error } = await supabase
          .from('stripe_products_mapping')
          .update({
            stripe_product_id: mapping.stripeProductId,
            stripe_price_id: mapping.stripePriceId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMapping.id);

        if (error) throw error;
      } else {
        // Create new mapping
        const { error } = await supabase
          .from('stripe_products_mapping')
          .insert({
            company_id: companyId,
            plan_id: mapping.planId,
            stripe_product_id: mapping.stripeProductId,
            stripe_price_id: mapping.stripePriceId
          });

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-mappings', companyId] });
      toast({
        title: 'Mapeamento salvo',
        description: 'O mapeamento do plano foi salvo com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar mapeamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete plan mapping
  const deletePlanMapping = useMutation({
    mutationFn: async (mappingId: string) => {
      const { error } = await supabase
        .from('stripe_products_mapping')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-mappings', companyId] });
      toast({
        title: 'Mapeamento removido',
        description: 'O mapeamento do plano foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover mapeamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    stripeSettings,
    stripeMappings,
    isLoading: isLoading || settingsLoading || mappingsLoading,
    saveStripeSettings,
    syncStripeProducts,
    savePlanMapping,
    deletePlanMapping
  };
}
