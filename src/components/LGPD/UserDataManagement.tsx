import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Shield, 
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { useLGPDRequestsSimple } from '@/hooks/useLGPDRequestsSimple';
import { usePrivacyConsentSimple } from '@/hooks/usePrivacyConsentSimple';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UserDataManagement() {
  const { user } = useAuth();
  const { requests, createRequest, exportUserData, isCreating, isExporting } = useLGPDRequestsSimple();
  const { consent, revokeConsent, isRevoking } = usePrivacyConsentSimple();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'data_access':
        return 'Acesso aos Dados';
      case 'data_correction':
        return 'Correção de Dados';
      case 'data_deletion':
        return 'Exclusão de Dados';
      case 'data_export':
        return 'Exportação de Dados';
      default:
        return type;
    }
  };

  const maskDocument = (doc: string) => {
    if (!doc) return '';
    if (doc.length === 11) {
      // CPF
      return `${doc.slice(0, 3)}.***.**${doc.slice(-2)}`;
    } else if (doc.length === 14) {
      // CNPJ
      return `${doc.slice(0, 2)}.***.***/****-${doc.slice(-2)}`;
    }
    return doc;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Gestão de Dados Pessoais</h2>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Em conformidade com a LGPD, você tem direito ao acesso, correção, exclusão e portabilidade dos seus dados pessoais.
        </AlertDescription>
      </Alert>

      {/* Status do Consentimento */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Consentimento</CardTitle>
          <CardDescription>
            Informações sobre seu consentimento para coleta e tratamento de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consent ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Consentimento: {consent.accepted ? 'Aceito' : 'Recusado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {consent.accepted_at && 
                      `Aceito em ${formatDate(new Date(consent.accepted_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Versão: {consent.version}
                  </p>
                </div>
                {consent.accepted && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => revokeConsent()}
                    disabled={isRevoking}
                  >
                    {isRevoking ? 'Revogando...' : 'Revogar Consentimento'}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum consentimento registrado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meus Dados */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Dados Cadastrais</CardTitle>
          <CardDescription>
            Visualize e gerencie suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium">Nome:</span>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.display_name || 'Não informado'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">E-mail:</span>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'Não informado'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Documento:</span>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.document ? maskDocument(user.user_metadata.document) : 'Não informado'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Telefone:</span>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.phone || 'Não informado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações LGPD */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Direitos LGPD</CardTitle>
          <CardDescription>
            Exercite seus direitos conforme a Lei Geral de Proteção de Dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex items-start gap-3"
              onClick={() => createRequest({ request_type: 'data_access' })}
              disabled={isCreating}
            >
              <Eye className="h-5 w-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Solicitar Acesso</div>
                <div className="text-sm text-muted-foreground">
                  Ver quais dados temos sobre você
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-start gap-3"
              onClick={() => createRequest({ request_type: 'data_correction' })}
              disabled={isCreating}
            >
              <Edit className="h-5 w-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Solicitar Correção</div>
                <div className="text-sm text-muted-foreground">
                  Corrigir dados incorretos
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-start gap-3"
              onClick={() => exportUserData()}
              disabled={isExporting}
            >
              <Download className="h-5 w-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Exportar Dados</div>
                <div className="text-sm text-muted-foreground">
                  {isExporting ? 'Exportando...' : 'Baixar todos os seus dados'}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex items-start gap-3 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => createRequest({ request_type: 'data_deletion', notes: 'Solicitação de exclusão completa dos dados pessoais' })}
              disabled={isCreating}
            >
              <Trash2 className="h-5 w-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Solicitar Exclusão</div>
                <div className="text-sm text-muted-foreground">
                  Excluir permanentemente seus dados
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Solicitações */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Solicitações</CardTitle>
            <CardDescription>
              Acompanhe o status das suas solicitações LGPD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getRequestTypeLabel(request.request_type)}
                      </span>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Solicitado em {formatDate(new Date(request.requested_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.notes}
                      </p>
                    )}
                  </div>
                  {request.export_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={request.export_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Algumas solicitações podem levar até 72 horas para serem processadas. 
          Solicitações de exclusão são irreversíveis e resultarão na perda permanente de acesso à plataforma.
        </AlertDescription>
      </Alert>
    </div>
  );
}