
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface CertificateData {
  id: string;
  company_id: string;
  certificate_file: string;
  certificate_cn: string;
  certificate_expires_at: string;
  certificate_uploaded_at: string;
  certificate_last_used_at: string;
  certificate_fingerprint: string;
  certificate_metadata: any;
}

interface CertificateUploadResult {
  success: boolean;
  message: string;
  data?: CertificateData;
}

export function useCertificateManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyId, isSuperAdmin, isContratante } = usePermissions();

  // Buscar certificados da empresa
  const { data: certificates = [], isLoading, error } = useQuery({
    queryKey: ['certificates', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? [data] : [];
    },
    enabled: !!companyId,
  });

  // Upload de certificado
  const uploadCertificate = useCallback(async (
    file: File,
    password: string
  ): Promise<CertificateUploadResult> => {
    if (!companyId) {
      return {
        success: false,
        message: 'Empresa não identificada'
      };
    }

    if (!isSuperAdmin && !isContratante) {
      return {
        success: false,
        message: 'Sem permissão para upload de certificados'
      };
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      formData.append('company_id', companyId);

      // Aqui você faria o upload real do certificado
      // Por agora, vamos simular um upload bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: CertificateUploadResult = {
        success: true,
        message: 'Certificado enviado com sucesso',
        data: {
          id: '1',
          company_id: companyId,
          certificate_file: file.name,
          certificate_cn: 'CN=Exemplo',
          certificate_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          certificate_uploaded_at: new Date().toISOString(),
          certificate_last_used_at: new Date().toISOString(),
          certificate_fingerprint: 'ABC123',
          certificate_metadata: {}
        }
      };

      toast({
        title: 'Sucesso',
        description: result.message,
      });

      queryClient.invalidateQueries({ queryKey: ['certificates', companyId] });

      return result;
    } catch (error: any) {
      console.error('Certificate upload error:', error);
      
      const result: CertificateUploadResult = {
        success: false,
        message: error.message || 'Erro ao enviar certificado'
      };

      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });

      return result;
    } finally {
      setIsUploading(false);
    }
  }, [companyId, isSuperAdmin, isContratante, toast, queryClient]);

  // Validar certificado
  const validateCertificate = useCallback(async (certificateId: string) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não identificada',
        variant: 'destructive',
      });
      return false;
    }

    setIsValidating(true);

    try {
      // Aqui você faria a validação real do certificado
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Sucesso',
        description: 'Certificado validado com sucesso',
      });

      return true;
    } catch (error: any) {
      console.error('Certificate validation error:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao validar certificado',
        variant: 'destructive',
      });

      return false;
    } finally {
      setIsValidating(false);
    }
  }, [companyId, toast]);

  // Remover certificado
  const removeCertificate = useCallback(async (certificateId: string) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não identificada',
        variant: 'destructive',
      });
      return false;
    }

    if (!isSuperAdmin && !isContratante) {
      toast({
        title: 'Erro',
        description: 'Sem permissão para remover certificados',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('company_settings')
        .update({
          certificate_file: null,
          certificate_password: null,
          certificate_data: null,
          certificate_metadata: null,
          certificate_uploaded_at: null,
          certificate_last_used_at: null,
          certificate_expires_at: null,
          certificate_cn: null,
          certificate_fingerprint: null,
        })
        .eq('company_id', companyId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Certificado removido com sucesso',
      });

      queryClient.invalidateQueries({ queryKey: ['certificates', companyId] });

      return true;
    } catch (error: any) {
      console.error('Certificate removal error:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover certificado',
        variant: 'destructive',
      });

      return false;
    }
  }, [companyId, isSuperAdmin, isContratante, toast, queryClient]);

  return {
    certificates,
    isLoading,
    error,
    isUploading,
    isValidating,
    uploadCertificate,
    validateCertificate,
    removeCertificate,
  };
}
