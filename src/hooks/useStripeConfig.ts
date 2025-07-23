import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StripeConfig {
  id: string;
  company_id: string | null;
  stripe_publishable_key: string | null;
  stripe_secret_key_encrypted: string | null;
  stripe_webhook_secret_encrypted: string | null;
  default_currency: string;
  test_mode: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useStripeConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ["stripe-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stripe_config")
        .select("*")
        .is("company_id", null)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: {
      stripe_publishable_key: string;
      stripe_secret_key_encrypted: string;
      stripe_webhook_secret_encrypted?: string;
      default_currency?: string;
      test_mode?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("stripe_config")
        .upsert({
          company_id: null, // Configuração global
          ...configData,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe-config"] });
      toast({
        title: "Configuração salva",
        description: "Configuração do Stripe salva com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar configuração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (secretKey: string) => {
      // Fazer uma chamada simples à API do Stripe para testar a chave
      const response = await fetch("https://api.stripe.com/v1/balance", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Chave inválida ou erro na conexão com Stripe");
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Conexão testada",
        description: "Conexão com Stripe estabelecida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na conexão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    config,
    isLoading,
    error,
    saveConfig: saveConfigMutation.mutateAsync,
    testConnection: testConnectionMutation.mutateAsync,
    isSaving: saveConfigMutation.isPending,
    isTesting: testConnectionMutation.isPending,
  };
};