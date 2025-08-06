
import React from 'react';
import { MobileContainer, MobileCard } from '@/components/ui/mobile-optimized';

export function UserProfile() {
  return (
    <MobileContainer>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
        <MobileCard>
          <p className="text-muted-foreground">Aqui você pode gerenciar as informações do seu perfil.</p>
        </MobileCard>
      </div>
    </MobileContainer>
  );
}
