
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserSettings() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configurações do Usuário" 
        description="Personalize suas preferências do sistema"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Conta</CardTitle>
          <CardDescription>
            Ajuste suas configurações pessoais aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidade em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
