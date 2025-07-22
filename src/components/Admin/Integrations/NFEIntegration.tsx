
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';

export function NFEIntegration() {
  const nfeIntegration = useNFeIntegration();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integração Fiscal (NF-e)</CardTitle>
        <CardDescription>
          Configure a integração com serviços de emissão de notas fiscais eletrônicas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Configure as integrações fiscais para emissão de notas fiscais eletrônicas através da página de
          <a href="/configuracao-nfe" className="text-primary ml-1 hover:underline">Configuração NFe</a>.
        </p>
      </CardContent>
    </Card>
  );
}
