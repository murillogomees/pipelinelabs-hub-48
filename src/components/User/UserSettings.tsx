
import React from 'react';
import { MobileContainer, MobileCard } from '@/components/ui/mobile-optimized';

export function UserSettings() {
  return (
    <MobileContainer>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Configurações do Usuário</h1>
        <MobileCard>
          <p className="text-muted-foreground">Aqui você pode ajustar suas configurações pessoais.</p>
        </MobileCard>
      </div>
    </MobileContainer>
  );
}
