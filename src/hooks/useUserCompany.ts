
import { useCurrentCompany } from './useCurrentCompany';
import { useProfile } from './useProfile';

export const useUserCompany = () => {
  const { profile } = useProfile();
  const { data: currentCompany, isLoading, error } = useCurrentCompany();

  return {
    company: currentCompany?.company || null,
    companyId: currentCompany?.company_id || profile?.company_id || null,
    isLoading,
    error,
  };
};
