
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { VersionsList } from '@/components/Admin/VersionManagement/VersionsList';
import { CreateVersionDialog } from '@/components/Admin/VersionManagement/CreateVersionDialog';
import { EnvironmentConfigs } from '@/components/Admin/VersionManagement/EnvironmentConfigs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppVersions } from '@/hooks/useAppVersions';
import { Package, Settings, History } from 'lucide-react';

export default function AdminVersions() {
  const { data: versions, isLoading } = useAppVersions();

  return (
    <AdminPageLayout
      title="Gerenciamento de Versões"
      description="Controle versões, deployments e configurações de ambiente"
      icon={<Package className="h-6 w-6" />}
    >
      <div className="flex justify-between items-center mb-6">
        <div />
        <CreateVersionDialog />
      </div>

      <Tabs defaultValue="versions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versões
          </TabsTrigger>
          <TabsTrigger value="environments" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações de Ambiente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions">
          <VersionsList versions={versions || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="environments">
          <EnvironmentConfigs />
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
