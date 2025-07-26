
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SecurityConfig {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
    max_age_days: number;
    prevent_reuse: number;
  };
  session_settings: {
    max_session_duration: number;
    idle_timeout: number;
    require_2fa_for_admin: boolean;
    concurrent_sessions_limit: number;
  };
  rate_limiting: {
    login_attempts: { max: number; window: number };
    api_requests: { max: number; window: number };
    sensitive_operations: { max: number; window: number };
  };
  audit_retention: {
    security_logs_days: number;
    audit_logs_days: number;
    rate_limit_logs_days: number;
    auto_cleanup_enabled: boolean;
  };
}

export function useSecurityConfig() {
  return useQuery({
    queryKey: ['security-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_config')
        .select('config_key, config_value')
        .eq('is_active', true);

      if (error) throw error;

      const config: Partial<SecurityConfig> = {};
      data?.forEach((item) => {
        config[item.config_key as keyof SecurityConfig] = item.config_value;
      });

      return config as SecurityConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateSecurityConfig() {
  return async (configKey: keyof SecurityConfig, configValue: any) => {
    const { error } = await supabase.rpc('update_security_config', {
      p_config_key: configKey,
      p_config_value: configValue,
    });

    if (error) throw error;
  };
}
