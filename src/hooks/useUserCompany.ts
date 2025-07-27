
import { useProfile } from './useProfile';

// Backward compatibility wrapper
export const useUserCompany = () => {
  const { profile, isLoading, error } = useProfile();

  return {
    userCompany: profile ? {
      company_id: profile.company_id,
      company: profile.companies
    } : null,
    isLoading,
    error
  };
};
