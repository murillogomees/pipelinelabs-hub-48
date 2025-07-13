import React from 'react';
import { Puzzle } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <Puzzle className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma integração criada</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Comece criando sua primeira integração para disponibilizar às empresas.
      </p>
    </div>
  );
}