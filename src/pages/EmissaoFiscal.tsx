import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Settings, 
  Plus,
  Send,
  Download,
  Eye
} from 'lucide-react';
import { NFeDialog } from '@/components/NFe/NFeDialog';
import { useNFe } from '@/hooks/useNFe';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusColors = {
  draft: 'secondary',
  sent: 'outline',
  authorized: 'default',
  cancelled: 'destructive',
  rejected: 'destructive',
} as const;

const statusLabels = {
  draft: 'Rascunho',
  sent: 'Enviada',
  authorized: 'Autorizada',
  cancelled: 'Cancelada',
  rejected: 'Rejeitada',
} as const;

export function EmissaoFiscal() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { nfeList, isLoading } = useNFe();
  const { nfeIntegration, isConfigured } = useNFeIntegration();
  const [activeTab, setActiveTab] = useState('emissao');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Você precisa estar logado para acessar a emissão fiscal.
            </p>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/auth'}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Emissão Fiscal</h1>
          <p className="text-muted-foreground">
            Gerencie suas notas fiscais eletrônicas
          </p>
        </div>
      </div>

      {!isConfigured && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            A integração NFE.io não está configurada. {isAdmin && (
              <>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => window.location.href = '/configuracoes/nfe'}
                >
                  Configure agora
                </Button>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emissao" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova NFe
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Minhas NFes
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emissao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emitir Nova NFe</CardTitle>
            </CardHeader>
            <CardContent>
              {isConfigured ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Clique no botão abaixo para criar uma nova nota fiscal eletrônica.
                  </p>
                  <NFeDialog
                    trigger={
                      <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova NFe
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Configure a integração NFE.io antes de emitir notas fiscais.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total NFes</p>
                    <p className="text-2xl font-bold">{nfeList?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Autorizadas</p>
                    <p className="text-2xl font-bold">
                      {nfeList?.filter(nfe => nfe.status === 'authorized').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold">
                      {nfeList?.filter(nfe => nfe.status === 'draft').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejeitadas</p>
                    <p className="text-2xl font-bold">
                      {nfeList?.filter(nfe => nfe.status === 'rejected').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lista" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de NFes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : nfeList && nfeList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nfeList.map((nfe) => (
                      <TableRow key={nfe.id}>
                        <TableCell className="font-mono">
                          {nfe.invoice_number}
                        </TableCell>
                        <TableCell>
                          {nfe.customers?.name || 'Não informado'}
                        </TableCell>
                        <TableCell>
                          {new Date(nfe.issue_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          R$ {nfe.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[nfe.status as keyof typeof statusColors]}>
                            {statusLabels[nfe.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {nfe.status === 'authorized' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma NFe encontrada. Emita sua primeira nota fiscal!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Integração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {isConfigured ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600">Integração NFE.io configurada</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-600">Integração NFE.io não configurada</span>
                    </>
                  )}
                </div>

                {isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/configuracoes/nfe'}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Integração
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Configure os dados da sua empresa para emissão de notas fiscais.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/configuracoes'}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações da Empresa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
