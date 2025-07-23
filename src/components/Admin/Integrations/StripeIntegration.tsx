
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export function StripeIntegration() {
  const { canManagePlans } = usePermissions();

  if (!canManagePlans) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso restrito</AlertTitle>
        <AlertDescription>
          Você não tem permissão para gerenciar integrações com o Stripe.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Integração com Stripe - MOVIDA
        </CardTitle>
        <CardDescription>
          Esta funcionalidade foi movida para Administração → Stripe para centralizar as configurações globais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertTitle>Configuração centralizada</AlertTitle>
          <AlertDescription>
            As configurações do Stripe agora são globais e estão disponíveis em:
            <br />
            <strong>Administração → Stripe</strong>
            <br />
            Esta página será removida em uma próxima versão.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
