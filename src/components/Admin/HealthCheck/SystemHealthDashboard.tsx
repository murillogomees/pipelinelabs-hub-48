import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSystemHealth, usePerformHealthCheck } from "@/hooks/useHealthCheck";
import { 
  Heart, 
  Database, 
  Server, 
  Globe, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const StatusIcon = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'down':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  const variants = {
    healthy: 'default',
    degraded: 'secondary',
    down: 'destructive'
  } as const;

  const labels = {
    healthy: 'Saudável',
    degraded: 'Degradado',
    down: 'Indisponível'
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

export const SystemHealthDashboard = () => {
  const { data: health, isLoading, refetch } = useSystemHealth();
  const performHealthCheck = usePerformHealthCheck();

  const runHealthCheck = async (service: string) => {
    try {
      await performHealthCheck.mutateAsync(service);
      refetch(); // Refresh the overall health data
    } catch (error) {
      console.error(`Health check failed for ${service}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Status Geral do Sistema
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={health?.overall || 'down'} />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Uptime</div>
              <div className="text-2xl font-bold">{health?.uptime || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Última Verificação</div>
              <div className="text-sm">
                {health?.lastCheck 
                  ? format(new Date(health.lastCheck), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
                  : 'N/A'
                }
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Serviços Ativos</div>
              <div className="text-2xl font-bold">
                {health?.services?.filter(s => s.status === 'healthy').length || 0}/
                {health?.services?.length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {health?.services?.map((service) => (
          <Card key={service.service}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {service.service === 'database' && <Database className="h-5 w-5" />}
                  {service.service === 'api' && <Server className="h-5 w-5" />}
                  {service.service === 'frontend' && <Globe className="h-5 w-5" />}
                  {service.service.charAt(0).toUpperCase() + service.service.slice(1)}
                </div>
                <StatusIcon status={service.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={service.status} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runHealthCheck(service.service)}
                  disabled={performHealthCheck.isPending}
                >
                  {performHealthCheck.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    'Testar'
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tempo de Resposta</span>
                  <span className="font-mono">{service.responseTime}ms</span>
                </div>
                <Progress 
                  value={Math.min((service.responseTime / 1000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Última verificação: {format(new Date(service.lastChecked), "HH:mm:ss", { locale: ptBR })}
              </div>

              {service.details && Object.keys(service.details).length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Detalhes técnicos
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto">
                    {JSON.stringify(service.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};