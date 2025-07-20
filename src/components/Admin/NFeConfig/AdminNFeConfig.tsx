import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, TestTube, Settings, AlertCircle } from 'lucide-react';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import { useToast } from '@/hooks/use-toast';

export const AdminNFeConfig = () => {
  const { toast } = useToast();
  const { 
    saveNFeConfig, 
    testConnection, 
    getConfig, 
    isConfigured, 
    isActive,
    isSaving,
    testingConnection 
  } = useNFeIntegration();

  const [config, setConfig] = useState(() => ({
    api_token: '',
    environment: 'sandbox' as 'sandbox' | 'production',
    webhook_url: '',
    timeout: 30,
    ...getConfig()
  }));

  const handleSave = async () => {
    try {
      await saveNFeConfig(config);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  const handleTestConnection = async () => {
    try {
      await testConnection(config);
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Configuração NFE.io</h2>
            <p className="text-muted-foreground">
              Configure a integração global com a NFE.io para todas as empresas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured && (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da API
          </CardTitle>
          <CardDescription>
            Configure os parâmetros de conexão com a API da NFE.io
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api_token">Token da API NFE.io *</Label>
              <Input
                id="api_token"
                type="password"
                placeholder="Digite o token da API..."
                value={config.api_token || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, api_token: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Token obtido no painel administrativo da NFE.io
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                value={config.environment}
                onValueChange={(value: 'sandbox' | 'production') => 
                  setConfig(prev => ({ ...prev, environment: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Homologação</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="webhook_url">URL do Webhook</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://seu-dominio.com/webhook/nfe"
                value={config.webhook_url || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                URL para receber notificações de status das NFes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (segundos)</Label>
              <Input
                id="timeout"
                type="number"
                min="10"
                max="120"
                value={config.timeout || 30}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>
                Esta configuração será aplicada a todas as empresas do sistema
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testingConnection || !config.api_token}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testingConnection ? 'Testando...' : 'Testar Conexão'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving || !config.api_token}
              >
                {isSaving ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};