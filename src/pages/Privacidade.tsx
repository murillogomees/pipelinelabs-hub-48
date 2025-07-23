import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { usePrivacyTermsSimple } from '@/hooks/usePrivacyTermsSimple';
import { formatDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Privacidade() {
  const { terms, isLoading } = usePrivacyTermsSimple();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando política de privacidade...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Esta política descreve como coletamos, usamos e protegemos suas informações pessoais 
            em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>
          {terms && (
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Versão {terms.version}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Vigente desde {formatDate(new Date(terms.effective_date), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          )}
        </div>

        {/* Informações de Contato do Controlador */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Controlador de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Pipeline Labs</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>privacidade@pipelinelabs.app</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>(11) 99999-9999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>São Paulo, SP - Brasil</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Encarregado de Dados (DPO)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>dpo@pipelinelabs.app</span>
                  </div>
                  <p className="text-muted-foreground">
                    Entre em contato para questões sobre privacidade e proteção de dados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo da Política */}
        <Card>
          <CardContent className="p-8">
            {terms ? (
              <ScrollArea className="max-h-[800px] pr-4">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: terms.content }}
                />
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Política de privacidade não encontrada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seus Direitos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Seus Direitos como Titular dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">01</Badge>
                  <div>
                    <h4 className="font-medium">Acesso</h4>
                    <p className="text-sm text-muted-foreground">
                      Confirmar se tratamos seus dados e obter acesso a eles
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">02</Badge>
                  <div>
                    <h4 className="font-medium">Correção</h4>
                    <p className="text-sm text-muted-foreground">
                      Corrigir dados incompletos, inexatos ou desatualizados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">03</Badge>
                  <div>
                    <h4 className="font-medium">Anonimização</h4>
                    <p className="text-sm text-muted-foreground">
                      Solicitar anonimização de dados desnecessários
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">04</Badge>
                  <div>
                    <h4 className="font-medium">Bloqueio</h4>
                    <p className="text-sm text-muted-foreground">
                      Bloquear dados desnecessários ou excessivos
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">05</Badge>
                  <div>
                    <h4 className="font-medium">Eliminação</h4>
                    <p className="text-sm text-muted-foreground">
                      Eliminar dados tratados com consentimento revogado
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">06</Badge>
                  <div>
                    <h4 className="font-medium">Portabilidade</h4>
                    <p className="text-sm text-muted-foreground">
                      Obter dados em formato estruturado e legível
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">07</Badge>
                  <div>
                    <h4 className="font-medium">Informação</h4>
                    <p className="text-sm text-muted-foreground">
                      Obter informações sobre compartilhamento de dados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">08</Badge>
                  <div>
                    <h4 className="font-medium">Revogação</h4>
                    <p className="text-sm text-muted-foreground">
                      Revogar consentimento a qualquer momento
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Como exercer seus direitos:</strong> Acesse seu painel de usuário ou entre em contato conosco 
                através dos canais informados acima. Responderemos em até 72 horas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center gap-4 mt-8">
          <Button asChild>
            <a href="/app/user/dados-pessoais">
              Gerenciar Meus Dados
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:privacidade@pipelinelabs.app">
              Entrar em Contato
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}