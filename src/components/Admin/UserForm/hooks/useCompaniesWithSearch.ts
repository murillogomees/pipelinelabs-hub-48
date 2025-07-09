import { supabase } from '@/integrations/supabase/client';
import { SearchableOption } from '@/components/ui/searchable-select';

export function useCompaniesWithSearch() {
  const loadCompanies = async (search: string = "", page: number = 1, pageSize: number = 20) => {
    let query = supabase
      .from('companies')
      .select('id, name', { count: 'exact' })
      .order('name', { ascending: true });

    // Aplicar filtro de busca se fornecido
    if (search.trim()) {
      query = query.ilike('name', `%${search}%`);
    }

    // Aplicar paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao carregar empresas:', error);
      return {
        options: [],
        hasMore: false,
        total: 0
      };
    }

    const options: SearchableOption[] = (data || []).map(company => ({
      value: company.id,
      label: company.name
    }));

    const total = count || 0;
    const hasMore = from + pageSize < total;

    return {
      options,
      hasMore,
      total
    };
  };

  return { loadCompanies };
}