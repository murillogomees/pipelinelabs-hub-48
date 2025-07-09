import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Users, Package, Bell, Webhook } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useSubscription } from '@/hooks/useSubscription';

export function SistemaTab() {
  const { settings, loading, updateSettings } = useCompanySettings();
  const { subscription } = useSubscription();
  const [formData, setFormData] = useState({
    crossdocking_padrao: 0,
    estoque_tolerancia_minima: 10,
    funcionalidades: {
      ordem_producao: false,
      envio_automatico: false,
      pdv: false,
      multicanal: false,
      relatorios_avancados: false
    },
    notificacoes: {
      email: true,
      whatsapp: false,
      alertas_estoque: true,
      alertas_vencimento: true
    },
    webhooks: [] as Array<{ url: string; eventos: string[] }>
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        crossdocking_padrao: settings.crossdocking_padrao || 0,
        estoque_tolerancia_minima: settings.estoque_tolerancia_minima || 10,
        funcionalidades: (settings.funcionalidades_ativas as any) || {
          ordem_producao: false,
          envio_automatico: false,
          pdv: false,
          multicanal: false,
          relatorios_avancados: false
        },
        notificacoes: (settings.notificacoes as any) || {
          email: true,
          whatsapp: false,
          alertas_estoque: true,
          alertas_vencimento: true
        },
        webhooks: Array.isArray(settings.webhooks) 
          ? (settings.webhooks as Array<{ url: string; eventos: string[] }>) 
          : []
      });
    }
  }, [settings]);

  const handleFuncionalidadeChange = (funcionalidade: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      funcionalidades: {
        ...prev.funcionalidades,
        [funcionalidade]: enabled
      }
    }));
  };

  const handleNotificacaoChange = (notificacao: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificacoes: {
        ...prev.notificacoes,
        [notificacao]: enabled
      }
    }));
  };

  const handleSave = async () => {
    await updateSettings({
      crossdocking_padrao: formData.crossdocking_padrao,
      estoque_tolerancia_minima: formData.estoque_tolerancia_minima,
      funcionalidades_ativas: formData.funcionalidades,
      notificacoes: formData.notificacoes,
      webhooks: formData.webhooks
    });
  };

  const getPlanoInfo = () => {
    if (!subscription?.plan_id) return null;
    
    // This would come from your plans data
    const planoAtual = 'Plano Básico'; // Mock data
    const usuariosPermitidos = 5; // Mock data
    const usuariosAtivos = 2; // Mock data

    return { planoAtual, usuariosPermitidos, usuariosAtivos };
  };

  const planoInfo = getPlanoInfo();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Informações do Plano */}
      {planoInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações do Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Plano Atual</Label>
                <p className="text-lg font-semibold">{planoInfo.planoAtual}</p>
              </div>
              <div>
                <Label>Usuários Permitidos</Label>
                <p className="text-lg font-semibold">{planoInfo.usuariosPermitidos}</p>
              </div>
              <div>
                <Label>Usuários Ativos</Label>
                <p className="text-lg font-semibold">
                  {planoInfo.usuariosAtivos}
                  <Badge variant={planoInfo.usuariosAtivos >= planoInfo.usuariosPermitidos ? "destructive" : "default"} className="ml-2">
                    {planoInfo.usuariosAtivos >= planoInfo.usuariosPermitidos ? "Limite Atingido" : "Disponível"}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações Operacionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Configurações Operacionais
          </CardTitle>
          <CardDescription>Configure parâmetros operacionais do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crossdocking_padrao">Dias para Crossdocking Padrão</Label>
              <Input
                id="crossdocking_padrao"
                type="number"
                value={formData.crossdocking_padrao}
                onChange={(e) => setFormData(prev => ({ ...prev, crossdocking_padrao: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque_tolerancia_minima">Tolerância de Estoque Mínimo (%)</Label>
              <Input
                id="estoque_tolerancia_minima"
                type="number"
                value={formData.estoque_tolerancia_minima}
                onChange={(e) => setFormData(prev => ({ ...prev, estoque_tolerancia_minima: parseInt(e.target.value) || 10 }))}
                placeholder="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Módulos e Funcionalidades
          </CardTitle>
          <CardDescription>Ative ou desative módulos conforme seu plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'ordem_producao', label: 'Ordem de Produção', description: 'Módulo de controle de produção' },
              { key: 'envio_automatico', label: 'Envio Automático', description: 'Integração com transportadoras' },
              { key: 'pdv', label: 'PDV (Ponto de Venda)', description: 'Sistema de ponto de venda' },
              { key: 'multicanal', label: 'Vendas Multicanal', description: 'Integração com marketplaces' },
              { key: 'relatorios_avancados', label: 'Relatórios Avançados', description: 'Dashboards e analytics' }
            ].map((funcionalidade) => (
              <div key={funcionalidade.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{funcionalidade.label}</p>
                  <p className="text-sm text-muted-foreground">{funcionalidade.description}</p>
                </div>
                <Switch
                  checked={formData.funcionalidades[funcionalidade.key as keyof typeof formData.funcionalidades]}
                  onCheckedChange={(checked) => handleFuncionalidadeChange(funcionalidade.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificações
          </CardTitle>
          <CardDescription>Configure como receber alertas e notificações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'email', label: 'Notificações por E-mail', description: 'Receber alertas por e-mail' },
              { key: 'whatsapp', label: 'Notificações por WhatsApp', description: 'Receber alertas no WhatsApp' },
              { key: 'alertas_estoque', label: 'Alertas de Estoque', description: 'Notificar quando estoque baixo' },
              { key: 'alertas_vencimento', label: 'Alertas de Vencimento', description: 'Notificar vencimentos próximos' }
            ].map((notificacao) => (
              <div key={notificacao.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{notificacao.label}</p>
                  <p className="text-sm text-muted-foreground">{notificacao.description}</p>
                </div>
                <Switch
                  checked={formData.notificacoes[notificacao.key as keyof typeof formData.notificacoes]}
                  onCheckedChange={(checked) => handleNotificacaoChange(notificacao.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks (Admin only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>Configure webhooks para integração com sistemas externos</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Webhook className="h-4 w-4" />
            <AlertDescription>
              Webhooks permitem que seu sistema receba notificações em tempo real sobre eventos importantes. 
              Configure URLs que receberão dados quando ações específicas ocorrerem no sistema.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Configurar Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Salvar Configurações do Sistema
      </Button>
    </div>
  );
}