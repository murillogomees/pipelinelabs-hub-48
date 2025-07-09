import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { SearchableSelect, SearchableOption } from '@/components/ui/searchable-select';
import { useCompaniesWithSearch } from '../hooks/useCompaniesWithSearch';
import { supabase } from '@/integrations/supabase/client';

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isRequired?: boolean;
}

export function CompanySelector({ 
  value, 
  onChange, 
  disabled = false, 
  isRequired = false 
}: CompanySelectorProps) {
  const { loadCompanies } = useCompaniesWithSearch();
  const [defaultOption, setDefaultOption] = useState<SearchableOption | null>(null);

  // Carregar empresa padrão (Pipeline Labs) para mostrar no select
  useEffect(() => {
    const loadDefaultCompany = async () => {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('name', 'Pipeline Labs')
        .limit(1);

      if (companies && companies.length > 0) {
        const company = companies[0];
        setDefaultOption({
          value: company.id,
          label: company.name
        });
      }
    };

    loadDefaultCompany();
  }, []);

  // Array com a empresa padrão para mostrar quando não há busca
  const staticOptions = defaultOption ? [defaultOption] : [];

  return (
    <div className="space-y-2">
      <Label htmlFor="company_id">
        Empresa {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <SearchableSelect
        value={value}
        onValueChange={onChange}
        placeholder="Selecione a empresa..."
        searchPlaceholder="Buscar empresa..."
        disabled={disabled}
        loadOptions={loadCompanies}
        staticOptions={staticOptions}
        emptyMessage="Nenhuma empresa encontrada"
        pageSize={10}
      />
    </div>
  );
}