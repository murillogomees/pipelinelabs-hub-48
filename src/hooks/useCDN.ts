import { useState, useEffect } from 'react';
import { useCompanySettings } from './useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { validateCDNDomain } from '@/utils/cdn';

interface CDNConfig {
  enabled: boolean;
  baseUrl: string;
  customDomain?: string;
  mode: 'public' | 'private' | 'mixed';
  cacheSettings: {
    images: number;
    videos: number;
    documents: number;
  };
}

export function useCDN() {
  const { settings, updateSettings } = useCompanySettings();
  const [testing, setTesting] = useState(false);

  const cdnConfig: CDNConfig = {
    enabled: (settings as any)?.cdn_enabled ?? true,
    baseUrl: (settings as any)?.cdn_url_base ?? 'https://cdn.pipelinelabs.app',
    customDomain: (settings as any)?.cdn_custom_domain,
    mode: (settings as any)?.cdn_mode ?? 'public',
    cacheSettings: (settings as any)?.cdn_cache_settings ?? {
      images: 86400,
      videos: 604800,
      documents: 3600
    }
  };

  const testCDNConnection = async (domain?: string): Promise<boolean> => {
    try {
      setTesting(true);
      const testUrl = domain || cdnConfig.baseUrl;
      
      if (!validateCDNDomain(testUrl)) {
        return false;
      }

      const response = await fetch(`${testUrl}/health`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return true;
    } catch (error) {
      console.error('CDN connection test failed:', error);
      return false;
    } finally {
      setTesting(false);
    }
  };

  const updateCDNConfig = async (config: Partial<CDNConfig>): Promise<boolean> => {
    try {
      const updates: any = {};
      
      if (config.enabled !== undefined) updates.cdn_enabled = config.enabled;
      if (config.baseUrl) updates.cdn_url_base = config.baseUrl;
      if (config.customDomain !== undefined) updates.cdn_custom_domain = config.customDomain;
      if (config.mode) updates.cdn_mode = config.mode;
      if (config.cacheSettings) updates.cdn_cache_settings = config.cacheSettings;

      return await updateSettings(updates);
    } catch (error) {
      console.error('Failed to update CDN config:', error);
      return false;
    }
  };

  return {
    config: cdnConfig,
    testConnection: testCDNConnection,
    updateConfig: updateCDNConfig,
    testing
  };
}