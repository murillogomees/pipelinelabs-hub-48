
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompanyOption {
  id: string;
  name: string;
}

export function useCompaniesQuery() {
  return useQuery<CompanyOption[], Error>({
    queryKey: ['companies-for-user-form'],
    queryFn: async (): Promise<CompanyOption[]> => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      return (data || []);
    }
  });
}
