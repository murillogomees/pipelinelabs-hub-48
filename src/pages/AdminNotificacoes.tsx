
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Settings } from 'lucide-react';

export default function AdminNotificacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Notificações</h1>
        <p className="text-muted-foreground">
          Configure como o sistema envia notificações para os usuários
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notificações por Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-orders">Novos pedidos</Label>
              <Switch id="email-orders" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-payments">Pagamentos recebidos</Label>
              <Switch id="email-payments" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-stock">Estoque baixo</Label>
              <Switch id="email-stock" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-errors">Erros do sistema</Label>
              <Switch id="email-errors" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notificações WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp-orders">Novos pedidos</Label>
              <Switch id="whatsapp-orders" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp-payments">Pagamentos recebidos</Label>
              <Switch id="whatsapp-payments" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="whatsapp-deliveries">Status de entrega</Label>
              <Switch id="whatsapp-deliveries" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações Push
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-realtime">Tempo real</Label>
              <Switch id="push-realtime" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-summary">Resumo diário</Label>
              <Switch id="push-summary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Globais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="global-enabled">Sistema de notificações ativo</Label>
              <Switch id="global-enabled" defaultChecked />
            </div>
            <Button className="w-full">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
