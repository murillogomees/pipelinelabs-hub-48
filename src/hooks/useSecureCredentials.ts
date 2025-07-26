
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

interface SecureCredential {
  id: string;
  company_id: string;
  credential_type: string;
  credential_name: string;
  encrypted_value: string;
  encryption_method: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_used_at?: string;
  expires_at?: string;
  metadata: Record<string, any>;
}

export function useSecureCredentials() {
  const { data: currentCompany } = useCurrentCompany();
  const { toast } = useToast();

  const { data: credentials, isLoading, error } = useQuery({
    queryKey: ['secure-credentials', currentCompany?.company_id],
    queryFn: async () => {
      if (!currentCompany?.company_id) return [];

      const { data, error } = await supabase
        .from('secure_credentials')
        .select('*')
        .eq('company_id', currentCompany.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SecureCredential[];
    },
    enabled: !!currentCompany?.company_id,
  });

  return {
    credentials,
    isLoading,
    error
  };
}

export function useStoreSecureCredential() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: currentCompany } = useCurrentCompany();

  return useMutation({
    mutationFn: async ({
      credentialType,
      credentialName,
      value,
      metadata = {}
    }: {
      credentialType: string;
      credentialName: string;
      value: string;
      metadata?: Record<string, any>;
    }) => {
      if (!currentCompany?.company_id) {
        throw new Error('Company not found');
      }

      // Generate a company-specific encryption key (in production, use proper key management)
      const encryptionKey = `company_${currentCompany.company_id}_key`;

      // Encrypt the value using the database function
      const { data: encryptedValue, error: encryptError } = await supabase.rpc(
        'encrypt_sensitive_field',
        {
          plaintext: value,
          encryption_key: encryptionKey
        }
      );

      if (encryptError) throw encryptError;

      const { data, error } = await supabase
        .from('secure_credentials')
        .insert({
          company_id: currentCompany.company_id,
          credential_type: credentialType,
          credential_name: credentialName,
          encrypted_value: encryptedValue,
          metadata,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-credentials'] });
      toast({
        title: 'Sucesso',
        description: 'Credencial armazenada com segurança',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: `Falha ao armazenar credencial: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}

export function useDecryptCredential() {
  const { data: currentCompany } = useCurrentCompany();
  const [isDecrypting, setIsDecrypting] = useState(false);

  const decryptCredential = async (credentialId: string): Promise<string | null> => {
    if (!currentCompany?.company_id) return null;

    setIsDecrypting(true);
    try {
      // Get the encrypted credential
      const { data: credential, error: fetchError } = await supabase
        .from('secure_credentials')
        .select('encrypted_value')
        .eq('id', credentialId)
        .eq('company_id', currentCompany.company_id)
        .single();

      if (fetchError) throw fetchError;

      // Generate the same encryption key used during storage
      const encryptionKey = `company_${currentCompany.company_id}_key`;

      // Decrypt using the database function
      const { data: decryptedValue, error: decryptError } = await supabase.rpc(
        'decrypt_sensitive_field',
        {
          ciphertext: credential.encrypted_value,
          encryption_key: encryptionKey
        }
      );

      if (decryptError) throw decryptError;

      // Update last_used_at
      await supabase
        .from('secure_credentials')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', credentialId);

      return decryptedValue;
    } catch (error) {
      console.error('Error decrypting credential:', error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  };

  return { decryptCredential, isDecrypting };
}
