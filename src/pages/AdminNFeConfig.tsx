import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  TestTube, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Save,
  Key,
  Globe,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface NFeGlobalConfig {
  api_token?: string;
  environment?: 'sandbox' | 'production';
  webhook_url?: string;
  timeout?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminNFeConfig() {
  const [config, setConfig] = useState<NFeGlobalConfig>({
    environment: 'sandbox',
    timeout: 30,
    is_active: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTest, setConnectionTest] = useState<{
    status?: 'success' | 'error';
    message?: string;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      
      // Buscar configuração global da NFE.io
      const { data: existingConfig, error } = await supabase
        .from('integrations_available')
        .select('*')
        .eq('name', 'NFE.io')
        .eq('type', 'fiscal')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingConfig?.config_schema) {
        // Parse the JSON config from config_schema field
        const configData = existingConfig.config_schema as any;
        setConfig({
          api_token: configData.api_token || '',
          environment: configData.environment || 'sandbox',
          webhook_url: configData.webhook_url || '',
          timeout: configData.timeout || 30,
          is_active: existingConfig.is_active || false,
          created_at: existingConfig.created_at,
          updated_at: existingConfig.updated_at
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configuração NFE.io",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);

      const integrationData = {
        name: 'NFE.io',
        type: 'fiscal',
        description: 'Integração para emissão de Notas Fiscais Eletrônicas',
        is_active: config.is_active || false,
        config_schema: {
          api_token: config.api_token,
          environment: config.environment,
          webhook_url: config.webhook_url,
          timeout: config.timeout
        }
      };

      // Verificar se já existe
      const { data: existing } = await supabase
        .from('integrations_available')
        .select('id')
        .eq('name', 'NFE.io')
        .eq('type', 'fiscal')
        .single();

      let result;
      if (existing) {
        // Atualizar existente
        result = await supabase
          .from('integrations_available')
          .update(integrationData)
          .eq('id', existing.id);
      } else {
        // Criar novo
        result = await supabase
          .from('integrations_available')
          .insert([integrationData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Sucesso",
        description: "Configuração NFE.io salva com sucesso!",
      });

      await loadConfig();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar configuração",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.api_token) {
      toast({
        title: "Erro",
        description: "API Token é obrigatório para testar a conexão",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTestingConnection(true);
      setConnectionTest({});

      const { data, error } = await supabase.functions.invoke('test-nfe-connection', {
        body: {
          api_token: config.api_token,
          environment: config.environment
        }
      });

      if (error) {
        throw error;
      }

      setConnectionTest({
        status: data.success ? 'success' : 'error',
        message: data.message || (data.success ? 'Conexão estabelecida com sucesso!' : 'Falha na conexão')
      });

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Conexão com NFE.io estabelecida com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: data.message || "Falha ao conectar com NFE.io",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
      setConnectionTest({
        status: 'error',
        message: error.message || 'Erro interno no teste de conexão'
      });
      toast({
        title: "Erro",
        description: "Falha no teste de conexão",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute requireSuperAdmin>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configuração Global NFE.io</h1>
            <p className="text-muted-foreground">
              Configure a integração NFE.io para todas as empresas
            </p>
          </div>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Teste de Conexão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Configuração da API
                    </CardTitle>
                    <CardDescription>
                      Configure as credenciais e parâmetros da NFE.io
                    </CardDescription>
                  </div>
                  <Badge variant={config.is_active ? "default" : "secondary"}>
                    {config.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_token">API Token *</Label>
                    <Input
                      id="api_token"
                      type="password"
                      placeholder="Seu token da API NFE.io"
                      value={config.api_token || ''}
                      onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Ambiente</Label>
                    <Select 
                      value={config.environment} 
                      onValueChange={(value: 'sandbox' | 'production') => 
                        setConfig({ ...config, environment: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                        <SelectItem value="production">Produção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">URL do Webhook</Label>
                    <Input
                      id="webhook_url"
                      placeholder="https://seu-dominio.com/api/nfe/webhook"
                      value={config.webhook_url || ''}
                      onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (segundos)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="10"
                      max="120"
                      value={config.timeout || 30}
                      onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Status da Integração</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para disponibilizar a integração para as empresas
                    </p>
                  </div>
                  <Button
                    variant={config.is_active ? "destructive" : "default"}
                    onClick={() => setConfig({ ...config, is_active: !config.is_active })}
                  >
                    {config.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button onClick={saveConfig} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Teste de Conexão
                </CardTitle>
                <CardDescription>
                  Teste a conectividade com a API NFE.io
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection || !config.api_token}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
                </Button>

                {connectionTest.status && (
                  <Alert className={connectionTest.status === 'success' ? 'border-green-200 bg-green-50' : ''}>
                    {connectionTest.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {connectionTest.message}
                    </AlertDescription>
                  </Alert>
                )}

                {config.created_at && (
                  <div className="text-sm text-muted-foreground pt-4">
                    <p>Criado em: {new Date(config.created_at).toLocaleString()}</p>
                    {config.updated_at && (
                      <p>Atualizado em: {new Date(config.updated_at).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}