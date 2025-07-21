import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Settings, AlertTriangle, Activity } from 'lucide-react';
import { AdminNFeConfig } from '@/components/Admin/NFeConfig/AdminNFeConfig';
import { ContratanteCertificateManager } from '@/components/Admin/NFeConfig/ContratanteCertificateManager';
import { NFeConnectionTest } from '@/components/Admin/NFeConfig/NFeConnectionTest';
import { NFeStatusMonitor } from '@/components/Admin/NFeConfig/NFeStatusMonitor';
import { useUserRole } from '@/hooks/useUserRole';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';

export default function ConfiguracaoNFe() {
  const { isSuperAdmin, isContratante } = useUserRole();
  const { nfeIntegration } = useNFeIntegration();

  if (!nfeIntegration) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            A integração NFE.io não está disponível. Entre em contato com o administrador do sistema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isSuperAdmin && !isContratante) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso restrito. Você não tem permissão para acessar as configurações de NFe.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configuração NFE.io</h1>
          <p className="text-muted-foreground">
            Gerencie a integração com NFE.io para emissão automática de notas fiscais
          </p>
        </div>
      </div>

{isSuperAdmin ? (
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config Global
            </TabsTrigger>
            <TabsTrigger value="certificate" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Certificado A1
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Teste
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="space-y-6">
            <AdminNFeConfig />
          </TabsContent>

          <TabsContent value="certificate" className="space-y-6">
            <ContratanteCertificateManager />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <NFeConnectionTest />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <NFeStatusMonitor />
          </TabsContent>
        </Tabs>
      ) : isContratante ? (
        <Tabs defaultValue="certificate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="certificate" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Certificado A1
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Teste
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificate" className="space-y-6">
            <ContratanteCertificateManager />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <NFeConnectionTest />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <NFeStatusMonitor />
          </TabsContent>
        </Tabs>
      ) : (
        <ContratanteCertificateManager />
      )}

      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre a Integração NFE.io</CardTitle>
          <CardDescription>
            Informações importantes sobre a integração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Ambientes Suportados</h4>
              <p className="text-sm text-muted-foreground">
                • Homologação (sandbox)<br />
                • Produção
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Tipos de Certificado</h4>
              <p className="text-sm text-muted-foreground">
                • Certificado A1 (.pfx/.p12)<br />
                • Validação automática
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Funcionalidades</h4>
              <p className="text-sm text-muted-foreground">
                • Emissão automática<br />
                • Envio por e-mail<br />
                • Consulta de status
              </p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Segurança:</strong> Todos os certificados são armazenados de forma criptografada 
              e apenas usuários autorizados podem acessá-los.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}