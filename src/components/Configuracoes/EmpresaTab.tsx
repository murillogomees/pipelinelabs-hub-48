
import React from 'react';
import { CompanyForm } from '@/components/Settings/Company/CompanyForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function EmpresaTab() {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Os dados da sua empresa são carregados automaticamente a partir do cadastro vinculado ao seu usuário.
          Todas as alterações serão salvas na estrutura completa do sistema.
        </AlertDescription>
      </Alert>
      
      <CompanyForm />
    </div>
  );
}
