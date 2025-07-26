
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AccessLevelOption {
  id: string;
  name: string;
  display_name: string;
  permissions: Record<string, boolean>;
}

export function useAccessLevelsQuery() {
  return useQuery<AccessLevelOption[], Error>({
    queryKey: ['access-levels-for-user-form'],
    queryFn: async (): Promise<AccessLevelOption[]> => {
      const { data, error } = await supabase
        .from('access_levels')
        .select('id, name, display_name, permissions')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        display_name: item.display_name,
        permissions: (item.permissions && typeof item.permissions === 'object') 
          ? item.permissions as Record<string, boolean>
          : {}
      }));
    }
  });
}
