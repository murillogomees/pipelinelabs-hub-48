
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SearchableSelect, SearchableOption } from '@/components/ui/searchable-select';
import { useCompaniesWithSearch } from '../hooks/useCompaniesWithSearch';
import { CompanyDialog } from '../../CompanyDialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isRequired?: boolean;
  error?: string;
}

export function CompanySelector({ 
  value, 
  onChange, 
  disabled = false, 
  isRequired = false,
  error
}: CompanySelectorProps) {
  const { loadCompanies } = useCompaniesWithSearch();
  const [defaultOption, setDefaultOption] = useState<SearchableOption | null>(null);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

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
        const option = {
          value: company.id,
          label: company.name
        };
        setDefaultOption(option);
        
        // Se não há valor selecionado, definir Pipeline Labs como padrão
        if (!value) {
          onChange(company.id);
        }
      }
    };

    loadDefaultCompany();
  }, [value, onChange]);

  // Array com a empresa padrão para mostrar quando não há busca
  const staticOptions = defaultOption ? [defaultOption] : [];

  const handleCompanyCreated = (companyId: string, companyName: string) => {
    // Atualizar a lista de opções estáticas
    const newOption = { value: companyId, label: companyName };
    setDefaultOption(newOption);
    
    // Selecionar a nova empresa
    onChange(companyId);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="company_id">
        Empresa {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
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
            className={error ? 'border-red-500' : ''}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCompanyDialog(true)}
          disabled={disabled}
          title="Adicionar nova empresa"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <CompanyDialog
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        onCompanyCreated={handleCompanyCreated}
      />
    </div>
  );
}
