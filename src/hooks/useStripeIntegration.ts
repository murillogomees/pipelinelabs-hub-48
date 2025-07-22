
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface StripeSettings {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
  products: Record<string, any>;
  planMappings?: Record<string, { stripeProductId: string; stripePriceId: string }>;
}

interface StripeMapping {
  id: string;
  plan_id: string;
  stripe_product_id: string;
  stripe_price_id: string;
}

interface SaveSettingsParams {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
}

interface PlanMappingParams {
  planId: string;
  stripeProductId: string;
  stripePriceId: string;
}

export function useStripeIntegration(companyId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get company settings with Stripe data
  const { data: stripeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['stripe-settings', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching Stripe settings:', error);
          return null;
        }

        if (!data) {
          return {
            secretKey: '',
            publishableKey: '',
            webhookSecret: '',
            products: {},
            planMappings: {}
          } as StripeSettings;
        }

        // Safe property access with fallbacks - using correct column names
        return {
          secretKey: (data as any).stripe_secret_key || '',
          publishableKey: (data as any).stripe_publishable_key || '',
          webhookSecret: (data as any).stripe_webhook_secret || '',
          products: (data as any).stripe_products || {},
          planMappings: {}
        } as StripeSettings;
      } catch (err) {
        console.error('Error in stripeSettings query:', err);
        return null;
      }
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false
  });

  // Get stripe mappings from the existing table
  const { data: stripeMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['stripe-mappings', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      try {
        const { data, error } = await (supabase as any)
          .from('stripe_products_mapping')
          .select('*')
          .eq('company_id', companyId);

        if (error) {
          console.error('Error fetching stripe mappings:', error);
          return [];
        }

        return (data || []) as StripeMapping[];
      } catch (err) {
        console.error('Error in stripeMappings query:', err);
        return [];
      }
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false
  });

  // Save Stripe API keys
  const saveStripeSettings = useMutation({
    mutationFn: async (settings: SaveSettingsParams) => {
      if (!companyId) throw new Error('Company ID is required');

      try {
        // Check if company_settings exists for this company
        const { data: existingSettings, error: checkError } = await supabase
          .from('company_settings')
          .select('id')
          .eq('company_id', companyId)
          .maybeSingle();

        if (checkError) throw checkError;

        const updateData = {
          stripe_secret_key: settings.secretKey,
          stripe_publishable_key: settings.publishableKey,
          stripe_webhook_secret: settings.webhookSecret
        } as any;

        if (existingSettings) {
          // Update existing settings
          const { error } = await supabase
            .from('company_settings')
            .update(updateData)
            .eq('company_id', companyId);

          if (error) throw error;
        } else {
          // Create new settings
          const { error } = await supabase
            .from('company_settings')
            .insert({
              company_id: companyId,
              ...updateData
            } as any);

          if (error) throw error;
        }

        return { success: true };
      } catch (err) {
        console.error('Error saving Stripe settings:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-settings', companyId] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do Stripe foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
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
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://ycqinuwrlhuxotypqlfh.supabase.co/functions/v1/sync-stripe-products', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`
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
        } as any)
        .eq('company_id', companyId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['stripe-settings', companyId] });
      
      toast({
        title: 'Produtos sincronizados',
        description: `${data.products?.length || 0} produtos sincronizados com sucesso.`,
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
    mutationFn: async (mapping: PlanMappingParams) => {
      if (!companyId) throw new Error('Company ID is required');

      try {
        // Use the stripe_products_mapping table (cast to any for TypeScript)
        const { error } = await (supabase as any)
          .from('stripe_products_mapping')
          .upsert({
            company_id: companyId,
            plan_id: mapping.planId,
            stripe_product_id: mapping.stripeProductId,
            stripe_price_id: mapping.stripePriceId
          }, {
            onConflict: 'company_id,plan_id'
          });

        if (error) throw error;

        return { success: true };
      } catch (err) {
        console.error("Error in savePlanMapping:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-mappings', companyId] });
      toast({
        title: 'Mapeamento salvo',
        description: 'O mapeamento do plano foi salvo com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar mapeamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete plan mapping
  const deletePlanMapping = useMutation({
    mutationFn: async (planId: string) => {
      if (!companyId) throw new Error('Company ID is required');

      try {
        const { error } = await (supabase as any)
          .from('stripe_products_mapping')
          .delete()
          .eq('company_id', companyId)
          .eq('plan_id', planId);

        if (error) throw error;
        
        return { success: true };
      } catch (err) {
        console.error("Error in deletePlanMapping:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-mappings', companyId] });
      toast({
        title: 'Mapeamento removido',
        description: 'O mapeamento do plano foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover mapeamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    stripeSettings,
    stripeMappings: stripeMappings || [],
    isLoading: isLoading || settingsLoading || mappingsLoading,
    saveStripeSettings,
    syncStripeProducts,
    savePlanMapping,
    deletePlanMapping
  };
}
