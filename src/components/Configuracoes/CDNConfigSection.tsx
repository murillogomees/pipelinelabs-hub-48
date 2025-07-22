import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, TestTube, CheckCircle, XCircle, Info } from 'lucide-react';
import { useCDN } from '@/hooks/useCDN';
import { useToast } from '@/hooks/use-toast';

interface CDNConfigSectionProps {
  hasAccess: boolean;
}

export function CDNConfigSection({ hasAccess }: CDNConfigSectionProps) {
  const { config, updateConfig, testConnection, testing } = useCDN();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    enabled: config.enabled,
    baseUrl: config.baseUrl,
    customDomain: config.customDomain || '',
    mode: config.mode,
    cacheSettings: { ...config.cacheSettings }
  });
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleTest = async () => {
    const result = await testConnection(formData.customDomain || formData.baseUrl);
    setTestResult(result);
    
    toast({
      title: result ? "Conexão CDN OK" : "Falha na Conexão CDN",
      description: result 
        ? "CDN está funcionando corretamente" 
        : "Verifique a URL do CDN e tente novamente",
      variant: result ? "default" : "destructive"
    });
  };

  const handleSave = async () => {
    const success = await updateConfig(formData);
    
    if (success) {
      toast({
        title: "Configurações CDN Salvas",
        description: "As configurações de CDN foram atualizadas com sucesso"
      });
    } else {
      toast({
        title: "Erro ao Salvar",
        description: "Falha ao salvar as configurações de CDN",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Configuração de CDN
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasAccess && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Funcionalidade Limitada:</strong> CDN personalizado disponível apenas em planos superiores.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="cdn-enabled">Habilitar CDN</Label>
              <Switch
                id="cdn-enabled"
                checked={formData.enabled}
                onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
                disabled={!hasAccess}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cdn-base-url">URL Base do CDN</Label>
              <Input
                id="cdn-base-url"
                type="url"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://cdn.exemplo.com"
                disabled={!hasAccess}
              />
              <p className="text-xs text-muted-foreground">
                URL base para entrega de assets estáticos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cdn-custom-domain">Domínio Personalizado</Label>
              <Input
                id="cdn-custom-domain"
                type="url"
                value={formData.customDomain}
                onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                placeholder="https://assets.suaempresa.com"
                disabled={!hasAccess}
              />
              <p className="text-xs text-muted-foreground">
                Opcional: Use seu próprio domínio para CDN
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cdn-mode">Modo de Acesso</Label>
              <Select
                value={formData.mode}
                onValueChange={(mode: 'public' | 'private' | 'mixed') => 
                  setFormData(prev => ({ ...prev, mode }))
                }
                disabled={!hasAccess}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controla a visibilidade dos assets no CDN
              </p>
            </div>
          </div>

          {/* Configurações de Cache */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Configurações de Cache</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Tempo de cache em segundos por tipo de arquivo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cache-images">Imagens (JPG, PNG, WebP)</Label>
              <Input
                id="cache-images"
                type="number"
                value={formData.cacheSettings.images}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cacheSettings: { ...prev.cacheSettings, images: parseInt(e.target.value) || 0 }
                }))}
                placeholder="86400"
                disabled={!hasAccess}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cache-videos">Vídeos (MP4, WebM)</Label>
              <Input
                id="cache-videos"
                type="number"
                value={formData.cacheSettings.videos}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cacheSettings: { ...prev.cacheSettings, videos: parseInt(e.target.value) || 0 }
                }))}
                placeholder="604800"
                disabled={!hasAccess}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cache-documents">Documentos (PDF, DOC)</Label>
              <Input
                id="cache-documents"
                type="number"
                value={formData.cacheSettings.documents}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cacheSettings: { ...prev.cacheSettings, documents: parseInt(e.target.value) || 0 }
                }))}
                placeholder="3600"
                disabled={!hasAccess}
              />
            </div>
          </div>
        </div>

        {/* Teste de Conectividade */}
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={testing || !hasAccess}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>

          {testResult !== null && (
            <div className="flex items-center gap-2">
              {testResult ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conectado
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">
                    Falha na Conexão
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>

        {/* Estrutura de Pastas */}
        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Estrutura de Pastas CDN</Label>
          <div className="mt-2 text-xs font-mono text-muted-foreground">
            <div>{formData.baseUrl}/company/{'{'}&lt;company_id&gt;{'}'}/</div>
            <div className="ml-4">├── produtos/</div>
            <div className="ml-4">├── notas/</div>
            <div className="ml-4">├── uploads/</div>
            <div className="ml-4">├── logos/</div>
            <div className="ml-4">└── documentos/</div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={!hasAccess}>
            Salvar Configurações CDN
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}