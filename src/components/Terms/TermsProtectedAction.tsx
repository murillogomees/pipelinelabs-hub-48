import React from 'react';
import { useTermsOfServiceSimple } from '@/hooks/useTermsOfServiceSimple';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText } from 'lucide-react';

interface TermsProtectedActionProps {
  children: React.ReactNode;
  action?: string; // Nome da ação para melhor mensagem
  fallback?: React.ReactNode; // Componente alternativo quando não pode realizar ação
}

export function TermsProtectedAction({ 
  children, 
  action = "esta ação", 
  fallback 
}: TermsProtectedActionProps) {
  const { user } = useAuth();
  const { hasAcceptedCurrent } = useTermsOfServiceSimple();

  // Se não está logado, não mostrar nada
  if (!user) {
    return null;
  }

  // Se aceitou os termos, mostrar o conteúdo normalmente
  if (hasAcceptedCurrent) {
    return <>{children}</>;
  }

  // Se não aceitou os termos, mostrar aviso ou fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Você precisa aceitar os Termos de Uso para realizar {action}.
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('/termos-de-uso', '_blank')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Termos
        </Button>
      </AlertDescription>
    </Alert>
  );
}