import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketplaceAuth, type MarketplaceCredentials } from '@/hooks/useMarketplaceAuth';
import { toast } from 'sonner';
import { 
  Shield, 
  Key, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Globe,
  Store,
  Settings
} from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplace: string;
  channelId?: string;
  onSuccess?: () => void;
}

interface MarketplaceConfig {
  name: string;
  type: 'oauth2' | 'api_key';
  logo?: string;
  color: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    required: boolean;
    help?: string;
  }[];
  docsUrl?: string;
  setupInstructions: string[];
}

const MARKETPLACE_CONFIGS: Record<string, MarketplaceConfig> = {
  mercado_livre: {
    name: 'Mercado Livre',
    type: 'oauth2',
    color: 'bg-yellow-500',
    fields: [
      {
        key: 'client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'APP_ID do Mercado Livre',
        required: true,
        help: 'Encontre em Suas aplicações > Detalhes da aplicação'
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Secret Key do Mercado Livre',
        required: true,
        help: 'Mantenha em segurança - não compartilhe'
      }
    ],
    docsUrl: 'https://developers.mercadolibre.com.ar/pt_br/authentication-e-authorization',
    setupInstructions: [
      'Acesse o Painel de Desenvolvedores do Mercado Livre',
      'Crie uma nova aplicação ou use uma existente',
      'Configure o Redirect URI: ' + window.location.origin + '/app/marketplace-channels',
      'Copie o Client ID e Client Secret'
    ]
  },
  shopee: {
    name: 'Shopee',
    type: 'oauth2',
    color: 'bg-orange-500',
    fields: [
      {
        key: 'partner_id',
        label: 'Partner ID',
        type: 'text',
        placeholder: 'ID do parceiro Shopee',
        required: true
      },
      {
        key: 'partner_key',
        label: 'Partner Key',
        type: 'password',
        placeholder: 'Chave do parceiro',
        required: true
      },
      {
        key: 'shop_id',
        label: 'Shop ID',
        type: 'text',
        placeholder: 'ID da loja',
        required: true
      }
    ],
    docsUrl: 'https://open.shopee.com/documents?module=63&type=2',
    setupInstructions: [
      'Registre-se como desenvolvedor na Shopee Open Platform',
      'Crie uma nova aplicação',
      'Obtenha as credenciais Partner ID e Partner Key',
      'Configure as permissões necessárias'
    ]
  },
  amazon: {
    name: 'Amazon',
    type: 'oauth2',
    color: 'bg-orange-600',
    fields: [
      {
        key: 'client_id',
        label: 'Application ID',
        type: 'text',
        placeholder: 'Application ID da Amazon',
        required: true
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Client Secret da Amazon',
        required: true
      }
    ],
    docsUrl: 'https://developer-docs.amazon.com/sp-api/docs/registering-your-application',
    setupInstructions: [
      'Registre-se no Amazon Developer Console',
      'Crie uma aplicação SP-API',
      'Configure o Redirect URI',
      'Obtenha as credenciais de aplicação'
    ]
  },
  magazine_luiza: {
    name: 'Magazine Luiza',
    type: 'api_key',
    color: 'bg-blue-600',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Chave da API Magazine Luiza',
        required: true
      },
      {
        key: 'seller_id',
        label: 'Seller ID',
        type: 'text',
        placeholder: 'ID do vendedor',
        required: true
      }
    ],
    docsUrl: 'https://api.magazineluiza.com/',
    setupInstructions: [
      'Acesse o painel de integração do Magazine Luiza',
      'Solicite acesso à API',
      'Obtenha sua API Key e Seller ID',
      'Configure as permissões necessárias'
    ]
  },
  via_varejo: {
    name: 'Via Varejo (Casas Bahia)',
    type: 'api_key',
    color: 'bg-yellow-600',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Chave da API Via Varejo',
        required: true
      },
      {
        key: 'seller_id',
        label: 'Seller ID',
        type: 'text',
        placeholder: 'ID do vendedor',
        required: true
      }
    ],
    docsUrl: 'https://developers.viavarejo.com.br/',
    setupInstructions: [
      'Registre-se no portal de desenvolvedores Via Varejo',
      'Solicite acesso à API de vendedor',
      'Obtenha suas credenciais',
      'Configure os webhooks se necessário'
    ]
  }
};

export function AuthDialog({ open, onOpenChange, marketplace, channelId, onSuccess }: AuthDialogProps) {
  const [credentials, setCredentials] = useState<MarketplaceCredentials>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [step, setStep] = useState<'setup' | 'credentials' | 'connecting'>('setup');
  
  const { authenticate, isLoading } = useMarketplaceAuth();
  
  const config = MARKETPLACE_CONFIGS[marketplace];

  useEffect(() => {
    if (open) {
      setCredentials({});
      setStep('setup');
      setShowInstructions(false);
    }
  }, [open, marketplace]);

  const handleFieldChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateCredentials = () => {
    for (const field of config.fields) {
      if (field.required && !credentials[field.key]) {
        toast.error(`${field.label} é obrigatório`);
        return false;
      }
    }
    return true;
  };

  const handleConnect = async () => {
    if (!validateCredentials()) return;

    setStep('connecting');

    try {
      const response = await authenticate(marketplace, credentials, channelId);
      
      if (response.success) {
        toast.success(`${config.name} conectado com sucesso!`);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(response.error || 'Erro na autenticação');
        setStep('credentials');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(`Erro ao conectar: ${error.message}`);
      setStep('credentials');
    }
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
              <Store className="h-4 w-4 text-white" />
            </div>
            Conectar {config.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center gap-2 ${step === 'setup' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                step === 'setup' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Configuração</span>
            </div>
            
            <Separator orientation="horizontal" className="flex-1" />
            
            <div className={`flex items-center gap-2 ${step === 'credentials' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                step === 'credentials' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Credenciais</span>
            </div>
            
            <Separator orientation="horizontal" className="flex-1" />
            
            <div className={`flex items-center gap-2 ${step === 'connecting' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                step === 'connecting' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Conectando</span>
            </div>
          </div>

          {/* Step 1: Setup Instructions */}
          {step === 'setup' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Instruções de Configuração
                  </CardTitle>
                  <CardDescription>
                    Siga os passos abaixo para configurar a integração com {config.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-3">
                    {config.setupInstructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{instruction}</span>
                      </li>
                    ))}
                  </ol>

                  {config.docsUrl && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Documentação oficial:
                      </span>
                      <a 
                        href={config.docsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Acessar <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setStep('credentials')}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 'credentials' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Credenciais de Acesso
                  </CardTitle>
                  <CardDescription>
                    Insira as credenciais obtidas no painel do {config.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key} className="flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={credentials[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      />
                      {field.help && (
                        <p className="text-xs text-muted-foreground">{field.help}</p>
                      )}
                    </div>
                  ))}

                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700 dark:text-blue-400">
                      <strong>Segurança:</strong> Suas credenciais são criptografadas e armazenadas de forma segura. 
                      Nunca compartilhamos suas informações com terceiros.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('setup')}>
                  Voltar
                </Button>
                <Button onClick={handleConnect} disabled={isLoading}>
                  {config.type === 'oauth2' ? 'Autorizar' : 'Conectar'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Connecting */}
          {step === 'connecting' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center">
                      <h3 className="font-medium">Conectando com {config.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.type === 'oauth2' 
                          ? 'Uma nova janela foi aberta para autorização. Complete o processo na janela do marketplace.'
                          : 'Validando suas credenciais...'
                        }
                      </p>
                    </div>
                    
                    {config.type === 'oauth2' && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        Se a janela não abrir, verifique se o bloqueador de popup está desabilitado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}