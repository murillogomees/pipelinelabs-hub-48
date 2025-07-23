import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Settings, 
  GitBranch, 
  Calendar, 
  TrendingUp,
  Activity,
  Server
} from "lucide-react";
import { VersionsList } from "@/components/Admin/VersionManagement/VersionsList";
import { CreateVersionDialog } from "@/components/Admin/VersionManagement/CreateVersionDialog";
import { EnvironmentConfigs } from "@/components/Admin/VersionManagement/EnvironmentConfigs";
import { 
  useAppVersions, 
  useCurrentVersion, 
  useEnvironmentConfigs 
} from "@/hooks/useAppVersions";

export default function AdminVersions() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  
  const { data: allVersions, isLoading: versionsLoading } = useAppVersions();
  const { data: currentProdVersion } = useCurrentVersion('production');
  const { data: currentStagingVersion } = useCurrentVersion('staging');
  const { data: environments } = useEnvironmentConfigs();

  // Filter versions based on selected environment
  const filteredVersions = selectedEnvironment === 'all' 
    ? allVersions 
    : allVersions?.filter(v => v.environment === selectedEnvironment);

  const stats = {
    totalVersions: allVersions?.length || 0,
    productionVersion: currentProdVersion?.version_number || 'N/A',
    stagingVersion: currentStagingVersion?.version_number || 'N/A',
    activeEnvironments: environments?.filter(e => e.is_active).length || 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Versões</h1>
          <p className="text-muted-foreground">
            Controle de versões, deploys e configurações de ambiente
          </p>
        </div>
        <CreateVersionDialog />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Versões</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVersions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produção</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{stats.productionVersion}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homologação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{stats.stagingVersion}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ambientes Ativos</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEnvironments}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="versions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Versões
          </TabsTrigger>
          <TabsTrigger value="environments" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ambientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Histórico de Versões
                </CardTitle>
                <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os ambientes</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                    <SelectItem value="staging">Homologação</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <VersionsList 
                versions={filteredVersions || []} 
                isLoading={versionsLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnvironmentConfigs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}