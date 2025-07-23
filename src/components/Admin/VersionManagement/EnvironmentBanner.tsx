import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getEnvironment, getEnvironmentBadge, isStaging, isProduction } from "@/utils/environment";
import { AlertTriangle, Info, Zap } from "lucide-react";

export const EnvironmentBanner = () => {
  const environment = getEnvironment();
  const badge = getEnvironmentBadge();

  if (isProduction()) {
    return null; // Don't show banner in production
  }

  return (
    <Alert className={`border-l-4 ${
      isStaging() 
        ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }`}>
      <div className="flex items-center gap-2">
        {isStaging() ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        ) : (
          <Zap className="h-4 w-4 text-blue-600" />
        )}
        <Badge 
          variant={badge.variant}
          className={`${badge.color} text-white font-mono text-xs`}
        >
          {badge.label}
        </Badge>
      </div>
      <AlertDescription className="mt-2">
        {isStaging() ? (
          <>
            <strong>Ambiente de Homologação</strong> - Este é um ambiente de testes. 
            Mudanças aqui não afetam a produção. Dados podem ser fictícios ou mascarados.
          </>
        ) : (
          <>
            <strong>Ambiente de {environment.toUpperCase()}</strong> - Este é um ambiente de desenvolvimento/preview. 
            Use para testes e validações antes de publicar.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};