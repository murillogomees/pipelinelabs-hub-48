import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DynamicConfigForm } from './DynamicConfigForm';
import { MarketplaceIntegration, IntegrationFormData } from '@/hooks/useMarketplaceIntegrations';
import { Settings, TestTube, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface MarketplaceIntegrationCardProps {
  integration: MarketplaceIntegration;
  isConfigured?: boolean;
  currentConfig?: Record<string, any>;
  isActive?: boolean;
  lastSync?: string;
  onSave: (integrationId: string, data: IntegrationFormData) => Promise<void>;
  onTest: (integrationId: string, config: Record<string, any>) => Promise<boolean>;
  onSync: (integrationId: string) => Promise<void>;
  onRemove: (integrationId: string) => Promise<void>;
  isSaving?: boolean;
  isTesting?: boolean;
  isSyncing?: boolean;
}

export function MarketplaceIntegrationCard({
  integration,
  isConfigured = false,
  currentConfig = {},
  isActive = false,
  lastSync,
  onSave,
  onTest,
  onSync,
  onRemove,
  isSaving = false,
  isTesting = false,
  isSyncing = false
}: MarketplaceIntegrationCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<IntegrationFormData>({
    defaultValues: {
      config: {},
      credentials: {},
      is_active: isActive
    }
  });

  React.useEffect(() => {
    if (dialogOpen && isConfigured) {
      // Carregar configuração atual quando abrir o dialog
      const { config = {}, credentials = {} } = currentConfig;
      form.reset({
        config,
        credentials,
        is_active: isActive
      });
    }
  }, [dialogOpen, isConfigured, currentConfig, isActive, form]);

  const handleSubmit = async (data: IntegrationFormData) => {
    await onSave(integration.id, data);
    setDialogOpen(false);
  };

  const handleTest = async () => {
    const formData = form.getValues();
    const testConfig = { ...formData.config, ...formData.credentials };
    await onTest(integration.id, testConfig);
  };

  const getStatusInfo = () => {
    if (!isConfigured) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-muted-foreground" />,
        label: 'Não configurado',
        variant: 'secondary' as const
      };
    }
    if (!isActive) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
        label: 'Inativo',
        variant: 'outline' as const
      };
    }
    return {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      label: 'Ativo',
      variant: 'default' as const
    };
  };

  const status = getStatusInfo();

  // Separar campos por categoria
  const credentialFields = integration.config_schema.filter(field => 
    field.type === 'password' || 
    field.field.includes('key') || 
    field.field.includes('secret') ||
    field.field.includes('token')
  );
  
  const configFields = integration.config_schema.filter(field => 
    !credentialFields.some(cred => cred.field === field.field)
  );

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {integration.logo_url ? (
                <img 
                  src={integration.logo_url} 
                  alt={integration.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">
                  {integration.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="text-sm">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConfigured && lastSync && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Última sync: {new Date(lastSync).toLocaleString('pt-BR')}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                {isConfigured ? 'Configurar' : 'Configurar'}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <img src={integration.logo_url} alt={integration.name} className="w-6 h-6" />
                  Configurar {integration.name}
                </DialogTitle>
                <DialogDescription>
                  Configure as credenciais e parâmetros para integração com {integration.name}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <Tabs defaultValue="credentials" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="credentials">Credenciais</TabsTrigger>
                      <TabsTrigger value="config">Configurações</TabsTrigger>
                      <TabsTrigger value="advanced">Avançado</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="credentials" className="space-y-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Configure suas credenciais de acesso à API do {integration.name}
                      </div>
                      <DynamicConfigForm 
                        fields={credentialFields} 
                        form={form} 
                        section="credentials"
                      />
                    </TabsContent>
                    
                    <TabsContent value="config" className="space-y-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Configure os parâmetros de funcionamento da integração
                      </div>
                      <DynamicConfigForm 
                        fields={configFields} 
                        form={form} 
                        section="config"
                      />
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Status da Integração</label>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-muted-foreground">
                              Ativar/desativar esta integração
                            </span>
                            <Switch 
                              checked={form.watch('is_active')}
                              onCheckedChange={(checked) => form.setValue('is_active', checked)}
                            />
                          </div>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleTest}
                            disabled={isTesting}
                            className="flex-1"
                          >
                            <TestTube className="w-4 h-4 mr-2" />
                            {isTesting ? 'Testando...' : 'Testar Conexão'}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {isConfigured && isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync(integration.id)}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          )}

          {isConfigured && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Integração</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover a integração com {integration.name}? 
                    Esta ação não pode ser desfeita e você perderá todas as configurações.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onRemove(integration.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}