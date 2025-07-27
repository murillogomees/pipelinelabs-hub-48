
import { useCurrentCompany } from './useCurrentCompany';

export const useUserCompany = () => {
  const { data: currentCompany, isLoading, error } = useCurrentCompany();

  return {
    company: currentCompany?.company || null,
    companyId: currentCompany?.company_id || null,
    isLoading,
    error,
  };
};
