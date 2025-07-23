import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Temporary simple hook until Supabase types are updated
export function usePrivacyConsentSimple() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check localStorage for consent status
  const hasConsent = user ? localStorage.getItem(`privacy_consent_${user.id}`) === 'true' : false;

  const createConsent = async (params: {
    accepted: boolean;
    consent_type?: string;
    version?: string;
    metadata?: any;
  }) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Store in localStorage for now
      localStorage.setItem(`privacy_consent_${user.id}`, params.accepted.toString());
      localStorage.setItem(`privacy_consent_version_${user.id}`, params.version || '1.0');
      localStorage.setItem(`privacy_consent_metadata_${user.id}`, JSON.stringify(params.metadata || {}));
      localStorage.setItem(`privacy_consent_date_${user.id}`, new Date().toISOString());

      toast({
        title: "Consentimento registrado",
        description: "Suas preferências de privacidade foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao registrar consentimento",
        description: "Não foi possível salvar suas preferências de privacidade.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeConsent = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      localStorage.setItem(`privacy_consent_${user.id}`, 'false');
      localStorage.setItem(`privacy_consent_revoked_${user.id}`, new Date().toISOString());

      toast({
        title: "Consentimento revogado",
        description: "Seu consentimento foi revogado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao revogar consentimento",
        description: "Não foi possível revogar o consentimento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    consent: hasConsent ? {
      id: 'local',
      accepted: true,
      version: localStorage.getItem(`privacy_consent_version_${user?.id}`) || '1.0',
      accepted_at: localStorage.getItem(`privacy_consent_date_${user?.id}`) || new Date().toISOString(),
    } : null,
    isLoading,
    hasConsent,
    createConsent,
    revokeConsent,
    isCreating: isLoading,
    isRevoking: isLoading,
  };
}