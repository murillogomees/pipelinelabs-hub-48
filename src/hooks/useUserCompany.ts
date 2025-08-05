
import { useCurrentCompany } from './useCurrentCompany';

export const useUserCompany = () => {
  const { data: currentCompany, isLoading, error } = useCurrentCompany();
  
  return {
    companyId: currentCompany?.company_id,
    company: currentCompany?.company,
    role: currentCompany?.role,
    isLoading,
    error
  };
};
