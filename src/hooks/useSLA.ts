import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSLA() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current active SLA
  const { data: currentSLA, isLoading } = useQuery({
    queryKey: ['current-sla'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sla_agreements' as any)
        .select('*')
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Check if user has accepted current SLA
  const { data: hasAcceptedSLA } = useQuery({
    queryKey: ['sla-acceptance-status'],
    queryFn: async () => {
      if (!currentSLA) return true;
      
      const { data, error } = await supabase
        .from('sla_acceptance' as any)
        .select('id')
        .eq('sla_version', currentSLA.version)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!currentSLA,
  });

  // Fetch user's SLA acceptance history
  const { data: acceptanceHistory } = useQuery({
    queryKey: ['sla-acceptance-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sla_acceptance' as any)
        .select(`
          *,
          sla_agreements!inner(title, version)
        `)
        .order('accepted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Accept SLA mutation
  const acceptSLAMutation = useMutation({
    mutationFn: async (slaId: string) => {
      const response = await supabase.functions.invoke('create-sla-acceptance', {
        body: { sla_id: slaId }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-acceptance-status'] });
      queryClient.invalidateQueries({ queryKey: ['sla-acceptance-history'] });
      toast({
        title: "SLA Aceito",
        description: "O acordo de nível de serviço foi aceito com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao aceitar o SLA. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    currentSLA,
    hasAcceptedSLA,
    acceptanceHistory,
    isLoading,
    acceptSLA: acceptSLAMutation.mutate,
    isAccepting: acceptSLAMutation.isPending,
  };
}