import React from 'react';
import { Label } from '@/components/ui/label';
import { SearchableSelect, SearchableOption } from '@/components/ui/searchable-select';
import { useCompaniesWithSearch } from '../hooks/useCompaniesWithSearch';

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
        emptyMessage="Nenhuma empresa encontrada"
        pageSize={10}
      />
    </div>
  );
}