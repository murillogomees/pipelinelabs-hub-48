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
      
      // Update company settings with encrypted data using the correct field names
      const updateData = {
        certificate_data: encryptionResult.encryptedCertificate,
        certificate_password_encrypted: encryptionResult.encryptedPassword,
        certificate_iv: encryptionResult.certificateIV,
        certificate_password_iv: encryptionResult.passwordIV,
        certificate_cn: metadata.commonName,
        certificate_expires_at: metadata.expirationDate.toISOString(),
        certificate_fingerprint: fingerprint,
        certificate_uploaded_at: new Date().toISOString(),
        certificate_metadata: {
          issuer: metadata.issuer,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString()
        }
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
    if (!settings?.certificate_data || !settings?.certificate_password_encrypted) {
      toast({
        title: 'Nenhum certificado encontrado',
        description: 'Faça upload de um certificado primeiro.',
        variant: 'destructive',
      });
      return false;
    }

    setIsValidating(true);
    
    try {
      // Attempt to decrypt and validate the certificate
      await CertificateEncryption.decryptCertificate(
        settings.certificate_data,
        settings.certificate_password_encrypted,
        settings.certificate_iv!,
        settings.certificate_password_iv!
      );
      
      // Update last used timestamp
      await updateSettings({
        certificate_last_used_at: new Date().toISOString()
      });
      
      // Create audit log
      await createAuditLog('certificate_validation', {
        result: 'success',
        fingerprint: settings.certificate_fingerprint
      });
      
      toast({
        title: 'Certificado válido',
        description: 'O certificado foi validado com sucesso.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro na validação do certificado:', error);
      
      // Create audit log for failed validation
      await createAuditLog('certificate_validation', {
        result: 'failure',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      toast({
        title: 'Certificado inválido',
        description: 'Falha na validação do certificado. Verifique se os dados não foram corrompidos.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const getCertificateStatus = (): 'none' | 'valid' | 'expired' | 'expiring' => {
    if (!settings?.certificate_expires_at) return 'none';
    
    const expirationDate = new Date(settings.certificate_expires_at);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 30) return 'expiring';
    return 'valid';
  };

  const getDaysUntilExpiration = (): number | null => {
    if (!settings?.certificate_expires_at) return null;
    
    const expirationDate = new Date(settings.certificate_expires_at);
    const now = new Date();
    return Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const removeCertificate = async () => {
    try {
      const success = await updateSettings({
        certificate_data: null,
        certificate_password_encrypted: null,
        certificate_iv: null,
        certificate_password_iv: null,
        certificate_cn: null,
        certificate_expires_at: null,
        certificate_fingerprint: null,
        certificate_uploaded_at: null,
        certificate_last_used_at: null,
        certificate_metadata: null
      });
      
      if (success) {
        // Create audit log
        await createAuditLog('certificate_removal', {
          previousFingerprint: settings?.certificate_fingerprint
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

      // Create audit log entry directly in the table
      await supabase.from('audit_logs').insert({
        company_id: userCompany.company_id,
        user_id: user.id,
        action,
        resource_type: 'certificate',
        resource_id: settings?.certificate_fingerprint || 'unknown',
        details,
        severity: 'info',
        status: 'success'
      });
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
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