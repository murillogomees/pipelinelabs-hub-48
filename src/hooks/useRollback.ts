
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

export const useRollback = () => {
  const [isRollingBack, setIsRollingBack] = useState(false);
  const { isSuperAdmin } = usePermissions();
  const { toast } = useToast();

  const rollbackToVersion = async (versionId: string) => {
    if (!isSuperAdmin) {
      toast({
        title: 'Erro',
        description: 'Você não tem permissão para fazer rollback',
        variant: 'destructive',
      });
      return false;
    }

    setIsRollingBack(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('rollback-system', {
        body: { versionId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Rollback realizado com sucesso',
      });

      return true;
    } catch (error) {
      console.error('Rollback error:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao realizar rollback',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRollingBack(false);
    }
  };

  return {
    rollbackToVersion,
    isRollingBack
  };
};
