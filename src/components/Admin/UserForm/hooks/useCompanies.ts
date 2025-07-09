import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '../types';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const loadCompanies = async () => {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id, name');
      
      if (companiesData) {
        setCompanies(companiesData);
      }
    };
    
    loadCompanies();
  }, []);

  return companies;
}