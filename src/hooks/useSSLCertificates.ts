import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSSLCertificates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SSL certificates
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['ssl-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ssl_certificates' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Check certificate expiry
  const { data: certificateStatus } = useQuery({
    queryKey: ['ssl-certificate-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('check_ssl_certificate_expiry');
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000 * 60 * 60, // Check every hour
  });

  // Update certificate mutation
  const updateCertificateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('ssl_certificates' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['ssl-certificate-status'] });
      toast({
        title: "Certificado Atualizado",
        description: "Certificado SSL atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar certificado SSL.",
        variant: "destructive",
      });
    },
  });

  // Add certificate mutation
  const addCertificateMutation = useMutation({
    mutationFn: async (certificate: {
      domain: string;
      issued_by: string;
      valid_from: string;
      valid_until: string;
      fingerprint?: string;
    }) => {
      const { data, error } = await supabase
        .from('ssl_certificates' as any)
        .insert(certificate)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      toast({
        title: "Certificado Adicionado",
        description: "Certificado SSL adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar certificado SSL.",
        variant: "destructive",
      });
    },
  });

  return {
    certificates,
    certificateStatus,
    isLoading,
    updateCertificate: updateCertificateMutation.mutate,
    addCertificate: addCertificateMutation.mutate,
    isUpdating: updateCertificateMutation.isPending,
    isAdding: addCertificateMutation.isPending,
  };
}