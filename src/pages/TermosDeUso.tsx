import React from 'react';
import { useTermsOfServiceSimple } from '@/hooks/useTermsOfServiceSimple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, Hash, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TermosDeUso() {
  const { currentTerms } = useTermsOfServiceSimple();
  const navigate = useNavigate();

  if (!currentTerms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando termos de uso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{currentTerms.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    v{currentTerms.version}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(currentTerms.effective_date).toLocaleDateString('pt-BR')}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {currentTerms.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-primary" />
                Termos de Uso - Pipeline Labs
              </CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Leia atentamente todos os termos e condições para uso da plataforma Pipeline Labs.
                Este documento estabelece os direitos e responsabilidades entre você e nossa empresa.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {/* Scrollable Content Area */}
              <ScrollArea className="h-[60vh] px-6 pb-6">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                  <div dangerouslySetInnerHTML={{ __html: currentTerms.content }} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Footer Section */}
          <div className="mt-8 space-y-4">
            <Card className="bg-muted/30 border-0">
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">
                    Última atualização: {new Date(currentTerms.updated_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Para dúvidas sobre estes termos, entre em contato:</span>
                  <a 
                    href="mailto:juridico@pipelinelabs.app" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    juridico@pipelinelabs.app
                  </a>
                </div>
              </CardContent>
            </Card>
            
            {/* Back Button */}
            <div className="text-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="min-w-32"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}