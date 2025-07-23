import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  GitCommit, 
  Calendar, 
  User, 
  Package, 
  ExternalLink,
  ChevronDown,
  ChevronRight 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppVersion, useDeploymentLogs } from "@/hooks/useAppVersions";
import { RollbackDialog } from "./RollbackDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VersionsListProps {
  versions: AppVersion[];
  isLoading?: boolean;
}

const StatusBadge = ({ status }: { status: AppVersion['status'] }) => {
  const variants = {
    active: 'default',
    rolled_back: 'secondary',
    failed: 'destructive'
  } as const;

  const labels = {
    active: 'Ativo',
    rolled_back: 'Revertido',
    failed: 'Falhou'
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

const EnvironmentBadge = ({ environment }: { environment: AppVersion['environment'] }) => {
  const variants = {
    production: 'default',
    staging: 'secondary',
    preview: 'outline'
  } as const;

  const labels = {
    production: 'Produção',
    staging: 'Homologação',
    preview: 'Preview'
  };

  return (
    <Badge variant={variants[environment]}>
      {labels[environment]}
    </Badge>
  );
};

const DeploymentLogsSection = ({ versionId }: { versionId: string }) => {
  const { data: logs, isLoading } = useDeploymentLogs(versionId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando logs...</div>;
  }

  if (!logs || logs.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhum log de deployment encontrado</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Logs de Deployment</h4>
      <div className="space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  log.status === 'success' ? 'default' : 
                  log.status === 'failed' ? 'destructive' : 
                  log.status === 'running' ? 'secondary' : 'outline'
                }
                className="text-[10px] px-1 py-0"
              >
                {log.status}
              </Badge>
              <span className="font-mono">{log.step_name}</span>
            </div>
            <div className="text-muted-foreground">
              {log.duration_ms && `${log.duration_ms}ms`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VersionsList = ({ versions, isLoading }: VersionsListProps) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const toggleExpanded = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
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
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!versions.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma versão encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                v{version.version_number}
                <StatusBadge status={version.status} />
                <EnvironmentBadge environment={version.environment} />
              </CardTitle>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleExpanded(version.id)}
                  >
                    {expandedVersions.has(version.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {version.git_branch}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {version.git_sha.substring(0, 8)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(version.deployed_at), "dd/MM/yyyy 'às' HH:mm", { 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>

            {version.deployed_by && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Deployed por: {version.deployed_by}</span>
              </div>
            )}

            {version.release_notes && (
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2">Release Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {version.release_notes}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <RollbackDialog version={version} />
            </div>

            <Collapsible open={expandedVersions.has(version.id)}>
              <CollapsibleContent className="space-y-4">
                <DeploymentLogsSection versionId={version.id} />
                
                {Object.keys(version.metadata).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Metadados</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(version.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};