import React from 'react';
import { ExternalLink } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <ExternalLink className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma integração criada</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Comece criando sua primeira integração.
      </p>
    </div>
  );
};