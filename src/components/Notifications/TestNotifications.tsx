import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSystemNotification, NotificationHelpers } from '@/utils/notifications';
import { useToast } from '@/hooks/use-toast';

export function TestNotifications() {
  const { toast } = useToast();

  const testNotifications = [
    {
      name: 'Nova Venda',
      action: () => NotificationHelpers.newSale('João Silva', 299.90)
    },
    {
      name: 'Estoque Baixo',
      action: () => NotificationHelpers.lowStock('Produto Teste', 2, 10)
    },
    {
      name: 'Novo Produto',
      action: () => NotificationHelpers.newProduct('Produto de Teste')
    },
    {
      name: 'Pagamento Recebido',
      action: () => NotificationHelpers.paymentReceived('Maria Santos', 450.00)
    },
    {
      name: 'Erro de Integração',
      action: () => NotificationHelpers.integrationError('Mercado Livre', 'Falha na sincronização')
    },
    {
      name: 'Sucesso Integração',
      action: () => NotificationHelpers.integrationSuccess('Shopee')
    },
    {
      name: 'Pagamento Atrasado',
      action: () => NotificationHelpers.paymentOverdue('Pedro Costa', 5)
    },
    {
      name: 'Manutenção do Sistema',
      action: () => NotificationHelpers.systemMaintenance('15/07/2025 às 02:00')
    },
    {
      name: 'Notificação Personalizada',
      action: () => createSystemNotification({
        title: 'Teste Personalizado',
        message: 'Esta é uma notificação de teste personalizada com todos os recursos.',
        type: 'info',
        action_url: '/dashboard'
      })
    }
  ];

  const handleTest = async (testFn: () => Promise<void>) => {
    try {
      await testFn();
      toast({
        title: 'Notificação enviada',
        description: 'A notificação de teste foi criada com sucesso!'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar notificação de teste',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Notificações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {testNotifications.map((test, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleTest(test.action)}
              className="h-auto py-3"
            >
              {test.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Use estes botões para testar o sistema de notificações em tempo real.
        </p>
      </CardContent>
    </Card>
  );
}