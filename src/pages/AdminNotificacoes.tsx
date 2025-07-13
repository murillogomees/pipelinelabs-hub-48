import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Database, Zap } from 'lucide-react';

export function AdminNotificacoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administração de Notificações</h1>
        <p className="text-muted-foreground">
          Gerencie o sistema de notificações em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistema</p>
                <p className="text-2xl font-bold">Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Real</p>
                <p className="text-2xl font-bold">WebSocket</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supabase</p>
                <p className="text-2xl font-bold">Realtime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Notificações em Tempo Real</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema baseado em Supabase Realtime para atualizações instantâneas
                </p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Múltiplos Tipos</h3>
                <p className="text-sm text-muted-foreground">
                  Suporte a notificações de info, sucesso, aviso e erro
                </p>
              </div>
              <Badge variant="default">Implementado</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Ações Personalizadas</h3>
                <p className="text-sm text-muted-foreground">
                  Links para páginas específicas baseados no tipo de notificação
                </p>
              </div>
              <Badge variant="default">Implementado</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Persistência</h3>
                <p className="text-sm text-muted-foreground">
                  Notificações salvas no banco com controle de leitura
                </p>
              </div>
              <Badge variant="default">Implementado</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">RLS (Row Level Security)</h3>
                <p className="text-sm text-muted-foreground">
                  Cada empresa vê apenas suas próprias notificações
                </p>
              </div>
              <Badge variant="default">Seguro</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose text-sm">
            <h4 className="font-semibold">1. Criando Notificações</h4>
            <p className="text-muted-foreground">
              Use as funções helper em <code>NotificationHelpers</code> ou crie notificações customizadas com <code>createSystemNotification()</code>.
            </p>

            <h4 className="font-semibold mt-4">2. Tipos Disponíveis</h4>
            <ul className="text-muted-foreground">
              <li><Badge variant="outline" className="mr-2">info</Badge> Informações gerais</li>
              <li><Badge variant="outline" className="mr-2">success</Badge> Operações bem-sucedidas</li>
              <li><Badge variant="outline" className="mr-2">warning</Badge> Alertas e avisos</li>
              <li><Badge variant="outline" className="mr-2">error</Badge> Erros e falhas</li>
            </ul>

            <h4 className="font-semibold mt-4">3. Integração Automática</h4>
            <p className="text-muted-foreground">
              O sistema já está integrado com módulos principais como produtos, vendas e integrações para criar notificações automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}