
import { useEffect } from 'react';
import { useCompanyCompleteData } from './useCompanyCompleteData';

export function useCompanyDataDebug() {
  const { companyData, isLoading, canEdit } = useCompanyCompleteData();

  useEffect(() => {
    if (companyData) {
      console.group('🏢 Company Data Debug');
      console.log('📊 Dados da empresa carregados:', {
        id: companyData.id,
        name: companyData.name,
        document: companyData.document,
        role: companyData.user_company_role,
        canEdit,
        hasSettings: !!companyData.settings,
        settingsKeys: companyData.settings ? Object.keys(companyData.settings) : []
      });
      
      if (companyData.settings) {
        console.log('⚙️ Configurações encontradas:', companyData.settings);
      }
      
      console.groupEnd();
    }
  }, [companyData, canEdit]);

  return { companyData, isLoading, canEdit };
}
