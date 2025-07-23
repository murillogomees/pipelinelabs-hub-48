import { useState } from 'react';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLGPDRequestsSimple } from '@/hooks/useLGPDRequestsSimple';
import { usePrivacyConsentSimple } from '@/hooks/usePrivacyConsentSimple';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Download, 
  Trash2, 
  Shield, 
  Eye, 
  FileText, 
  Calendar,
  Mail,
  Building,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function UserDadosPessoais() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { 
    requests, 
    isLoading: requestsLoading, 
    createRequest, 
    isCreating 
  } = useLGPDRequestsSimple();
  const { 
    consent, 
    isLoading: consentsLoading,
    hasConsent
  } = usePrivacyConsentSimple();

  const [activeTab, setActiveTab] = useState('dados');

  const handleExportData = async () => {
    try {
      await createRequest({ request_type: 'data_export' });
      toast({
        title: "Solicitação criada",
        description: "Sua solicitação de exportação de dados foi registrada. Você receberá os dados em até 72 horas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao solicitar exportação de dados.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteData = async () => {
    try {
      await createRequest({ request_type: 'data_deletion' });
      toast({
        title: "Solicitação criada",
        description: "Sua solicitação de exclusão de dados foi registrada. Entraremos em contato em até 72 horas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao solicitar exclusão de dados.",
        variant: "destructive",
      });
    }
  };

  const handleRectifyData = async () => {
    try {
      await createRequest({ request_type: 'data_correction' });
      toast({
        title: "Solicitação criada",
        description: "Sua solicitação de retificação de dados foi registrada. Entraremos em contato em até 72 horas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao solicitar retificação de dados.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar logado para acessar seus dados pessoais.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Dados Pessoais</h1>
          <p className="text-muted-foreground">
            Gerencie seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD)
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="consentimentos">Consentimentos</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="direitos">Meus Direitos</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Dados que coletamos e armazenamos sobre você
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="text-sm">{profile?.display_name || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(user.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
                      <p className="text-sm">
                        {user.last_sign_in_at ? formatDistanceToNow(new Date(user.last_sign_in_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        }) : 'Primeiro acesso'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Metadados da Conta</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Endereço IP de criação da conta</p>
                      <p>• Histórico de logins e localização</p>
                      <p>• Preferências e configurações</p>
                      <p>• Dados de analytics de uso da plataforma</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consentimentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consentimentos de Privacidade
              </CardTitle>
              <CardDescription>
                Histórico dos seus consentimentos para coleta e processamento de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {consent ? (
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Consentimento Geral</div>
                        <div className="text-sm text-muted-foreground">
                          Aceito {formatDistanceToNow(new Date(consent.accepted_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                      <Badge variant="default">
                        Aceito
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum consentimento registrado</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solicitacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Solicitações LGPD
              </CardTitle>
              <CardDescription>
                Histórico das suas solicitações relacionadas aos seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {requests && requests.length > 0 ? (
                    requests.map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium capitalize">
                            {request.request_type === 'data_export' && 'Exportação de Dados'}
                            {request.request_type === 'data_deletion' && 'Exclusão de Dados'}
                            {request.request_type === 'data_correction' && 'Retificação de Dados'}
                            {request.request_type === 'data_access' && 'Acesso aos Dados'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Criada {formatDistanceToNow(new Date(request.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                          {request.notes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {request.notes}
                            </div>
                          )}
                        </div>
                        <Badge variant={
                          request.status === 'completed' ? 'default' : 
                          request.status === 'processing' ? 'secondary' : 
                          'outline'
                        }>
                          {request.status === 'pending' && 'Pendente'}
                          {request.status === 'processing' && 'Processando'}
                          {request.status === 'completed' && 'Concluída'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma solicitação registrada</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direitos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seus Direitos LGPD
              </CardTitle>
              <CardDescription>
                Exerça seus direitos sobre seus dados pessoais conforme a Lei Geral de Proteção de Dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">Direito de Acesso e Portabilidade</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Obtenha uma cópia de todos os dados pessoais que temos sobre você em formato estruturado e legível.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={handleExportData}
                        disabled={isCreating}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Meus Dados
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">Direito de Retificação</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Solicite a correção de dados pessoais incompletos, inexatos ou desatualizados.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleRectifyData}
                        disabled={isCreating}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Solicitar Retificação
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg border-red-200">
                  <div className="flex items-start gap-3">
                    <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">Direito de Exclusão</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Solicite a exclusão dos seus dados pessoais quando não houver mais necessidade de processamento.
                      </p>
                      <Alert className="mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          A exclusão dos dados resultará no encerramento da sua conta e não poderá ser desfeita.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={handleDeleteData}
                        disabled={isCreating}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Solicitar Exclusão
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Informações Importantes</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Todas as solicitações são processadas em até 72 horas conforme a LGPD</p>
                  <p>• Você receberá confirmação por e-mail sobre o status da sua solicitação</p>
                  <p>• Para dúvidas, entre em contato: privacidade@pipelinelabs.app</p>
                  <p>• Seus dados são processados com base no seu consentimento e necessidade contratual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}