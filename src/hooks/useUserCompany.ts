
import { useProfile } from './useProfile';

// Backward compatibility wrapper - now uses profile instead of user_companies
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
