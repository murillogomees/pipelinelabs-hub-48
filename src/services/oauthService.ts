import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

const logger = createLogger('OAuthService');

export interface OAuthConfig {
  marketplace: string;
  clientId?: string;
  redirectUrl?: string;
  scopes?: string[];
  state?: string;
}

export class OAuthService {
  private static instance: OAuthService;
  private popupWindow: Window | null = null;
  private pollTimer: number | null = null;

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Inicia o fluxo OAuth abrindo uma popup window
   */
  async initiateOAuth(config: OAuthConfig): Promise<any> {
    try {
      logger.info('Initiating OAuth flow', { marketplace: config.marketplace });

      // Chama a edge function para obter a URL de autorização
      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          action: 'get_auth_url',
          marketplace: config.marketplace,
          client_id: config.clientId,
          redirect_url: config.redirectUrl,
          scopes: config.scopes,
          state: config.state
        }
      });

      if (error) {
        logger.error('Error getting auth URL', error);
        throw error;
      }

      if (!data?.auth_url) {
        throw new Error('Não foi possível obter a URL de autorização');
      }

      // Abre a popup window
      return this.openOAuthPopup(data.auth_url, config.marketplace);
    } catch (error) {
      logger.error('OAuth initiation failed', error);
      throw error;
    }
  }

  /**
   * Abre uma popup window para o OAuth
   */
  private openOAuthPopup(authUrl: string, marketplace: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Fecha popup anterior se existir
      this.closePopup();

      // Calcula posição central da popup
      const width = 600;
      const height = 700;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      // Abre a popup
      this.popupWindow = window.open(
        authUrl,
        `oauth_${marketplace}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!this.popupWindow) {
        reject(new Error('Não foi possível abrir a janela de autorização. Verifique se o bloqueador de popup está desabilitado.'));
        return;
      }

      // Monitora a popup para detectar fechamento ou callback
      this.pollTimer = window.setInterval(() => {
        try {
          // Verifica se a popup foi fechada pelo usuário
          if (this.popupWindow?.closed) {
            this.cleanup();
            reject(new Error('Autorização cancelada pelo usuário'));
            return;
          }

          // Tenta acessar a URL da popup para detectar redirecionamento
          try {
            const popupUrl = this.popupWindow?.location?.href;
            if (popupUrl) {
              // Verifica se é uma URL de callback (contém código ou erro)
              const url = new URL(popupUrl);
              const code = url.searchParams.get('code');
              const error = url.searchParams.get('error');
              const state = url.searchParams.get('state');

              if (code || error) {
                this.cleanup();
                
                if (error) {
                  reject(new Error(`Erro na autorização: ${error}`));
                } else {
                  // Processa o código de autorização
                  this.processAuthorizationCode(marketplace, code!, state)
                    .then(resolve)
                    .catch(reject);
                }
              }
            }
          } catch (e) {
            // Cross-origin error - normal durante o fluxo OAuth
            // Continua monitorando
          }
        } catch (error) {
          logger.error('Error monitoring OAuth popup', error);
        }
      }, 1000);

      // Timeout após 10 minutos
      setTimeout(() => {
        if (this.pollTimer) {
          this.cleanup();
          reject(new Error('Timeout na autorização. Tente novamente.'));
        }
      }, 10 * 60 * 1000);
    });
  }

  /**
   * Processa o código de autorização recebido
   */
  private async processAuthorizationCode(marketplace: string, code: string, state?: string | null): Promise<any> {
    try {
      logger.info('Processing authorization code', { marketplace, state });

      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          action: 'process_callback',
          marketplace,
          code,
          state
        }
      });

      if (error) {
        logger.error('Error processing authorization code', error);
        throw error;
      }

      logger.info('OAuth flow completed successfully', { marketplace });
      return data;
    } catch (error) {
      logger.error('Failed to process authorization code', error);
      throw error;
    }
  }

  /**
   * Limpa recursos e fecha popup
   */
  private cleanup(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.closePopup();
  }

  /**
   * Fecha a popup window
   */
  private closePopup(): void {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
    }
    this.popupWindow = null;
  }

  /**
   * Conecta marketplace usando credenciais diretas (não OAuth)
   */
  async connectWithCredentials(marketplace: string, credentials: Record<string, any>, config: any): Promise<any> {
    try {
      logger.info('Connecting marketplace with credentials', { marketplace });

      const { data, error } = await supabase.functions.invoke('marketplace-connect', {
        body: {
          marketplace,
          type: 'credentials',
          credentials,
          config
        }
      });

      if (error) {
        logger.error('Error connecting with credentials', error);
        throw error;
      }

      logger.info('Marketplace connected successfully', { marketplace });
      return data;
    } catch (error) {
      logger.error('Failed to connect marketplace', error);
      throw error;
    }
  }

  /**
   * Conecta marketplace usando OAuth
   */
  async connectWithOAuth(marketplace: string, config: any): Promise<any> {
    try {
      logger.info('Connecting marketplace with OAuth', { marketplace });

      // Gera state aleatório para segurança
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Inicia fluxo OAuth
      const oauthResult = await this.initiateOAuth({
        marketplace,
        state,
        ...config
      });

      // Conecta usando o resultado do OAuth
      const { data, error } = await supabase.functions.invoke('marketplace-connect', {
        body: {
          marketplace,
          type: 'oauth',
          oauth_result: oauthResult,
          config
        }
      });

      if (error) {
        logger.error('Error connecting with OAuth', error);
        throw error;
      }

      logger.info('Marketplace connected via OAuth successfully', { marketplace });
      return data;
    } catch (error) {
      logger.error('Failed to connect marketplace via OAuth', error);
      throw error;
    }
  }
}