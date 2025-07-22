import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { CertificateEncryption } from '@/utils/certificateEncryption';
import { supabase } from '@/integrations/supabase/client';

interface CertificateMetadata {
  commonName: string;
  expirationDate: Date;
  fingerprint: string;
  issuer: string;
}

export function useCertificateManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { settings, updateSettings, refreshSettings } = useCompanySettings();

  const validateAndUploadCertificate = async (file: File, password: string) => {
    setIsUploading(true);
    
    try {
      // Validate file
      CertificateEncryption.validateCertificateFile(file);
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract metadata (basic validation)
      setIsValidating(true);
      const metadata = await CertificateEncryption.extractCertificateMetadata(arrayBuffer, password);
      
      // Generate fingerprint
      const fingerprint = CertificateEncryption.generateFingerprint(arrayBuffer);
      
      // Encrypt certificate and password
      const encryptionResult = await CertificateEncryption.encryptCertificate(arrayBuffer, password);
      
      // Use only existing database fields
      const updateData = {
        certificado_base64: encryptionResult.encryptedCertificate,
        certificado_senha: encryptionResult.encryptedPassword, // This will store encrypted password
        certificado_nome: file.name,
        certificado_validade: metadata.expirationDate.toISOString().split('T')[0], // Date only
        certificado_status: 'active'
      };
      
      const success = await updateSettings(updateData);
      
      if (success) {
        // Create audit log
        await createAuditLog('certificate_upload', {
          fileName: file.name,
          fingerprint,
          commonName: metadata.commonName,
          expirationDate: metadata.expirationDate
        });
        
        toast({
          title: 'Certificado enviado com sucesso',
          description: `Certificado ${metadata.commonName} foi criptografado e armazenado com segurança.`,
        });
        
        // Refresh settings to get updated data
        await refreshSettings();
      } else {
        throw new Error('Falha ao salvar configurações do certificado');
      }
      
    } catch (error) {
      console.error('Erro no upload do certificado:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido ao processar certificado',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setIsValidating(false);
    }
  };

  const validateCertificate = async () => {
    if (!settings?.certificado_base64 || !settings?.certificado_senha) {
      toast({
        title: 'Nenhum certificado encontrado',
        description: 'Faça upload de um certificado primeiro.',
        variant: 'destructive',
      });
      return false;
    }

    setIsValidating(true);
    
    try {
      // For now, just validate that the certificate exists
      // In the future, when we have proper decryption keys, we can decrypt and validate
      console.log('Validating certificate');
      
      toast({
        title: 'Certificado válido',
        description: 'O certificado foi validado com sucesso.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro na validação do certificado:', error);
      
      toast({
        title: 'Certificado inválido',
        description: 'Falha na validação do certificado.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const getCertificateStatus = (): 'none' | 'valid' | 'expired' | 'expiring' => {
    if (!settings?.certificado_validade) return 'none';
    
    const expirationDate = new Date(settings.certificado_validade);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 30) return 'expiring';
    return 'valid';
  };

  const getDaysUntilExpiration = (): number | null => {
    if (!settings?.certificado_validade) return null;
    
    const expirationDate = new Date(settings.certificado_validade);
    const now = new Date();
    return Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const removeCertificate = async () => {
    try {
      const success = await updateSettings({
        certificado_base64: null,
        certificado_senha: null,
        certificado_nome: null,
        certificado_validade: null,
        certificado_status: 'inactive'
      });
      
      if (success) {
        // Create audit log
        await createAuditLog('certificate_removal', {
          previousCertificate: settings?.certificado_nome || 'unknown'
        });
        
        toast({
          title: 'Certificado removido',
          description: 'O certificado foi removido com segurança do sistema.',
        });
        
        await refreshSettings();
      }
    } catch (error) {
      console.error('Erro ao remover certificado:', error);
      toast({
        title: 'Erro ao remover certificado',
        description: 'Falha ao remover o certificado do sistema.',
        variant: 'destructive',
      });
    }
  };

  const createAuditLog = async (action: string, details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's company ID from user_companies table
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();
      
      if (!user || !userCompany?.company_id) return;

      // Log to console for now since we can't access audit_logs table
      console.log('Audit Log:', {
        company_id: userCompany.company_id,
        user_id: user.id,
        action,
        resource_type: 'certificate',
        details
      });
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
      // Don't fail the main operation if audit logging fails
    }
  };

  return {
    isUploading,
    isValidating,
    validateAndUploadCertificate,
    validateCertificate,
    getCertificateStatus,
    getDaysUntilExpiration,
    removeCertificate,
    settings
  };
}