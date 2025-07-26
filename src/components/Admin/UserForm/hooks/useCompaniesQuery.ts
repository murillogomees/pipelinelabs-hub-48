
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompanyOption {
  id: string;
  name: string;
}

export function useCompaniesQuery() {
  return useQuery({
    queryKey: ['companies-for-user-form'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      return (data || []) as CompanyOption[];
    }
  });
}
