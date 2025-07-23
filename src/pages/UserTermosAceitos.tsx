import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTermsOfServiceSimple } from '@/hooks/useTermsOfServiceSimple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  Globe, 
  User, 
  ExternalLink,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

export default function UserTermosAceitos() {
  const { currentTerms, userAcceptance, hasAcceptedCurrent } = useTermsOfServiceSimple();

  const openTerms = () => {
    window.open('/termos-de-uso', '_blank');
  };

  const maskIp = (ip?: string) => {
    if (!ip || ip === 'unknown') return 'Não disponível';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return ip;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Termos de Uso Aceitos</h1>
              <p className="text-muted-foreground">
                Histórico de aceite dos termos de uso da plataforma
              </p>
            </div>
          </div>

          {/* Status atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasAcceptedCurrent ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                Status Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={hasAcceptedCurrent ? 'default' : 'destructive'}>
                      {hasAcceptedCurrent ? 'Em conformidade' : 'Aceite pendente'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasAcceptedCurrent 
                      ? 'Você aceitou a versão mais recente dos termos de uso'
                      : 'É necessário aceitar a versão atual dos termos para continuar usando o sistema'
                    }
                  </p>
                </div>
                <Button variant="outline" onClick={openTerms}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Termos Atuais
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Termos atuais */}
          <Card>
            <CardHeader>
              <CardTitle>Termos de Uso Vigentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Versão</p>
                    <p className="text-sm text-muted-foreground">{currentTerms?.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data de Vigência</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentTerms?.effective_date || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {currentTerms?.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de aceite */}
          {userAcceptance ? (
            <Card>
              <CardHeader>
                <CardTitle>Seu Aceite</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detalhes do seu aceite dos termos de uso
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Data do Aceite</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(userAcceptance.accepted_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Versão Aceita</p>
                        <p className="text-sm text-muted-foreground">
                          {userAcceptance.terms_version}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Endereço IP</p>
                        <p className="text-sm text-muted-foreground">
                          {maskIp(userAcceptance.ip_address)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Navegador</p>
                        <p className="text-sm text-muted-foreground truncate" title={userAcceptance.user_agent}>
                          {userAcceptance.user_agent ? 
                            userAcceptance.user_agent.split(' ')[0] : 
                            'Não disponível'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">URL dos Termos Aceitos</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                      {userAcceptance.terms_url || 'Não disponível'}
                    </code>
                    {userAcceptance.terms_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(userAcceptance.terms_url, '_blank')}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum aceite registrado</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não aceitou os termos de uso desta versão.
                </p>
                <Button onClick={openTerms}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver e Aceitar Termos
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Informações importantes */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-800">Informações Importantes</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• O aceite dos termos é obrigatório para utilizar a plataforma</li>
                    <li>• Sempre que os termos forem atualizados, será necessário um novo aceite</li>
                    <li>• Você será notificado quando houver alterações nos termos</li>
                    <li>• Este registro tem validade legal e é armazenado para auditoria</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}