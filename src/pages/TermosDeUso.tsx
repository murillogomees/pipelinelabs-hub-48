import React from 'react';
import { useTermsOfServiceSimple } from '@/hooks/useTermsOfServiceSimple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, Hash } from 'lucide-react';

export default function TermosDeUso() {
  const { currentTerms } = useTermsOfServiceSimple();

  if (!currentTerms) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Carregando termos de uso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto py-8">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {currentTerms.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span>Versão {currentTerms.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Vigência: {new Date(currentTerms.effective_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <Badge variant="secondary">
                  {currentTerms.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Termos de Uso
              </CardTitle>
              <p className="text-muted-foreground">
                Leia atentamente todos os termos e condições para uso da plataforma Pipeline Labs.
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentTerms.content }} />
              </div>
            </CardContent>
          </Card>

          {/* Footer info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Última atualização: {new Date(currentTerms.updated_at).toLocaleDateString('pt-BR')}
            </p>
            <p className="mt-2">
              Para dúvidas sobre estes termos, entre em contato conosco em{' '}
              <a href="mailto:juridico@pipelinelabs.app" className="text-primary hover:underline">
                juridico@pipelinelabs.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}