
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { AuditoriaConfigPanel } from '@/components/Admin/Auditoria/AuditoriaConfigPanel';
import { AuditoriaHistoricoPanel } from '@/components/Admin/Auditoria/AuditoriaHistoricoPanel';
import { AuditoriaExecutionPanel } from '@/components/Admin/Auditoria/AuditoriaExecutionPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, History, Play, Brain } from 'lucide-react';

export default function AdminAuditoria() {
  return (
    <AdminPageLayout
      title="Auditoria Automática"
      description="Configure e monitore auditorias automatizadas do projeto com aprendizado contínuo"
    >
      <div className="space-y-6">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuração</span>
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Execução</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Aprendizado</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <AuditoriaConfigPanel />
          </TabsContent>

          <TabsContent value="execution">
            <AuditoriaExecutionPanel />
          </TabsContent>

          <TabsContent value="history">
            <AuditoriaHistoricoPanel />
          </TabsContent>

          <TabsContent value="learning">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Sistema de Aprendizado Contínuo</h3>
              <p className="text-muted-foreground">
                O sistema de aprendizado contínuo está em desenvolvimento. 
                Ele analisará padrões de execução e melhorará automaticamente as sugestões de auditoria.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
