import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/Auth/AuthProvider';

// Temporary simple hook until Supabase types are updated
export function useLGPDRequestsSimple() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Mock requests from localStorage
  const getRequests = () => {
    if (!user) return [];
    const requests = localStorage.getItem(`lgpd_requests_${user.id}`);
    return requests ? JSON.parse(requests) : [];
  };

  const createRequest = async (params: {
    request_type: 'data_access' | 'data_correction' | 'data_deletion' | 'data_export';
    notes?: string;
  }) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const newRequest = {
        id: Date.now().toString(),
        user_id: user.id,
        request_type: params.request_type,
        status: 'pending',
        notes: params.notes,
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const currentRequests = getRequests();
      const updatedRequests = [newRequest, ...currentRequests];
      localStorage.setItem(`lgpd_requests_${user.id}`, JSON.stringify(updatedRequests));

      const typeLabels = {
        data_access: "acesso aos dados",
        data_correction: "correção de dados", 
        data_deletion: "exclusão de dados",
        data_export: "exportação de dados"
      };

      toast({
        title: "Solicitação criada",
        description: `Sua solicitação de ${typeLabels[params.request_type]} foi registrada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar solicitação",
        description: "Não foi possível registrar sua solicitação LGPD.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create mock user data export
      const userData = {
        profile: {
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name,
          phone: user.user_metadata?.phone,
          document: user.user_metadata?.document,
        },
        privacy_consents: [{
          accepted: localStorage.getItem(`privacy_consent_${user.id}`) === 'true',
          version: localStorage.getItem(`privacy_consent_version_${user.id}`) || '1.0',
          accepted_at: localStorage.getItem(`privacy_consent_date_${user.id}`),
        }],
        lgpd_requests: getRequests(),
        exported_at: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados",
        description: "Seus dados foram exportados e baixados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar seus dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requests: getRequests(),
    isLoading,
    createRequest,
    exportUserData,
    isCreating: isLoading,
    isExporting: isLoading,
  };
}