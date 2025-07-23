import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FILE_UPLOAD_LIMITS } from '../utils/brandingUtils';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File, type: 'logo' | 'favicon'): boolean => {
    const limits = FILE_UPLOAD_LIMITS[type];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > limits.maxSize) {
      const maxSizeMB = limits.maxSize / (1024 * 1024);
      toast({
        title: "Erro",
        description: `O arquivo deve ter no máximo ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    try {
      setUploading(true);
      
      const { data: companyId } = await supabase.rpc('get_user_company_id');
      if (!companyId) throw new Error('Company ID not found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${folder}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('whitelabel')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('whitelabel')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (
    file: File, 
    folder: string, 
    type: 'logo' | 'favicon'
  ): Promise<string | null> => {
    if (!validateFile(file, type)) return null;

    try {
      const url = await uploadFile(file, folder);
      toast({
        title: "Sucesso",
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} carregado com sucesso`
      });
      return url;
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao fazer upload do ${type === 'logo' ? 'logo' : 'favicon'}`,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    uploading,
    handleFileUpload
  };
};