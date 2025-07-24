import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketplaceCredentials {
  client_id?: string;
  client_secret?: string;
  api_key?: string;
  seller_id?: string;
  store_id?: string;
  partner_id?: string;
  partner_key?: string;
  shop_id?: string;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  auth_url?: string;
  message?: string;
  error?: string;
  valid?: boolean;
  profile?: any;
  data?: {
    marketplace: string;
    status: string;
    profile?: any;
    expires_at?: string;
  };
}

export interface ConnectionStatus {
  marketplace: string;
  connected: boolean;
  profile?: any;
  last_sync?: string;
  error?: string;
}

export function useMarketplaceAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authWindows, setAuthWindows] = useState<Map<string, Window>>(new Map());

  const authenticate = async (
    marketplace: string,
    credentials: MarketplaceCredentials,
    channelId?: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`🔐 Authenticating ${marketplace}...`);
      
      const redirectUri = `${window.location.origin}/app/marketplace-channels`;
      
      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          action: 'authenticate',
          marketplace,
          credentials,
          redirect_uri: redirectUri,
          channel_id: channelId
        }
      });

      if (error) {
        console.error('Authentication error:', error);
        throw new Error(error.message || 'Erro na autenticação');
      }

      const response: AuthResponse = data;

      if (response.auth_url) {
        // OAuth flow - open popup window
        const authWindow = openAuthWindow(response.auth_url, marketplace);
        setAuthWindows(prev => new Map(prev.set(marketplace, authWindow)));
        
        // Listen for authorization code
        return await waitForAuthCode(marketplace, credentials, channelId, authWindow);
      }

      // API key flow - direct authentication
      return response;

    } catch (error: any) {
      console.error('Authentication failed:', error);
      toast.error(`Erro ao conectar ${marketplace}: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (marketplace: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          action: 'refresh',
          marketplace
        }
      });

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const validateCredentials = async (marketplace: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          action: 'validate',
          marketplace
        }
      });

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error('Validation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const disconnect = async (marketplace: string, channelId?: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          action: 'disconnect',
          marketplace,
          channel_id: channelId
        }
      });

      if (error) throw new Error(error.message);

      toast.success(`${marketplace} desconectado com sucesso`);
      return data;
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      toast.error(`Erro ao desconectar ${marketplace}: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const getConnectionStatus = async (marketplace: string): Promise<ConnectionStatus> => {
    try {
      const response = await validateCredentials(marketplace);
      
      return {
        marketplace,
        connected: response.success && response.valid,
        profile: response.profile,
        error: response.error
      };
    } catch (error: any) {
      return {
        marketplace,
        connected: false,
        error: error.message
      };
    }
  };

  const openAuthWindow = (authUrl: string, marketplace: string): Window => {
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const authWindow = window.open(
      authUrl,
      `${marketplace}_auth`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!authWindow) {
      throw new Error('Popup bloqueado. Permita popups para este site.');
    }

    return authWindow;
  };

  const waitForAuthCode = async (
    marketplace: string,
    credentials: MarketplaceCredentials,
    channelId?: string,
    authWindow?: Window
  ): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      const pollForCode = () => {
        try {
          if (authWindow?.closed) {
            resolve({
              success: false,
              error: 'Autenticação cancelada pelo usuário'
            });
            return;
          }

          const url = authWindow?.location.href;
          
          if (url && url.includes('code=')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            const code = urlParams.get('code');
            
            authWindow?.close();
            setAuthWindows(prev => {
              const newMap = new Map(prev);
              newMap.delete(marketplace);
              return newMap;
            });

            if (code) {
              // Exchange code for tokens
              supabase.functions.invoke('marketplace-auth', {
                body: {
                  action: 'authenticate',
                  marketplace,
                  credentials,
                  code,
                  redirect_uri: `${window.location.origin}/app/marketplace-channels`,
                  channel_id: channelId
                }
              }).then(({ data, error }) => {
                if (error) {
                  resolve({
                    success: false,
                    error: error.message
                  });
                } else {
                  toast.success(`${marketplace} conectado com sucesso!`);
                  resolve(data);
                }
              });
            } else {
              resolve({
                success: false,
                error: 'Código de autorização não encontrado'
              });
            }
            return;
          }

          setTimeout(pollForCode, 1000);
        } catch (error) {
          // Still loading or cross-origin error, continue polling
          setTimeout(pollForCode, 1000);
        }
      };

      pollForCode();
    });
  };

  const closeAuthWindow = (marketplace: string) => {
    const authWindow = authWindows.get(marketplace);
    if (authWindow && !authWindow.closed) {
      authWindow.close();
      setAuthWindows(prev => {
        const newMap = new Map(prev);
        newMap.delete(marketplace);
        return newMap;
      });
    }
  };

  return {
    authenticate,
    refreshToken,
    validateCredentials,
    disconnect,
    getConnectionStatus,
    closeAuthWindow,
    isLoading
  };
}