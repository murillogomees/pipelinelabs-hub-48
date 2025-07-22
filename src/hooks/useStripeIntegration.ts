
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface StripeSettings {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
  products: Record<string, any>;
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
        } as StripeSettings;
      } catch (err) {
        console.error('Error in stripeSettings query:', err);
        return null;
      }
    },
    enabled: !!companyId,
    refetchOnWindowFocus: false
  });

  // Get plan mappings - use proper type handling
  const { data: stripeMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['stripe-mappings', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      // This table might not exist in the types yet, so we'll use a more generic approach
      try {
        const { data, error } = await supabase
          .rpc('get_stripe_mappings', { company_uuid: companyId });

        if (error) {
          // If RPC doesn't exist, fall back to direct query
          try {
            const { data: directData, error: directError } = await supabase
              .from('stripe_products_mapping')
              .select('id, plan_id, stripe_product_id, stripe_price_id')
              .eq('company_id', companyId);

            if (directError) {
              console.error('Error fetching Stripe mappings directly:', directError);
              return [];
            }

            return directData as StripeMapping[];
          } catch (fallbackErr) {
            console.error('Error in fallback query:', fallbackErr);
            return [];
          }
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
        })
        .eq('company_id', companyId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['stripe-settings', companyId] });
      
      toast({
        title: 'Produtos sincronizados',
        description: `${data.products.length || 0} produtos sincronizados com sucesso.`,
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

  // Create or update plan mapping - handle the table not being in types
  const savePlanMapping = useMutation({
    mutationFn: async (mapping: PlanMappingParams) => {
      if (!companyId) throw new Error('Company ID is required');

      try {
        // Try to use RPC first
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('save_stripe_mapping', {
            company_uuid: companyId,
            plan_uuid: mapping.planId,
            s_product_id: mapping.stripeProductId,
            s_price_id: mapping.stripePriceId
          });

        if (rpcError) {
          // Fallback to direct query if RPC doesn't exist
          // Check if mapping already exists
          const { data: existingMapping, error: queryError } = await supabase
            .from('stripe_products_mapping')
            .select('id')
            .eq('company_id', companyId)
            .eq('plan_id', mapping.planId)
            .maybeSingle();

          if (queryError && !queryError.message.includes('does not exist')) {
            console.error("Error checking for existing mapping:", queryError);
            throw queryError;
          }

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
        }

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

  // Delete plan mapping - handle the table not being in types
  const deletePlanMapping = useMutation({
    mutationFn: async (mappingId: string) => {
      try {
        // Try RPC first
        const { error: rpcError } = await supabase
          .rpc('delete_stripe_mapping', { mapping_uuid: mappingId });

        if (rpcError) {
          // Fallback to direct query
          const { error } = await supabase
            .from('stripe_products_mapping')
            .delete()
            .eq('id', mappingId);

          if (error) throw error;
        }
        
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
