import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, FileText } from 'lucide-react';
import { useTermsOfServiceSimple } from '@/hooks/useTermsOfServiceSimple';

interface TermsAcceptanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export function TermsAcceptanceModal({ open, onOpenChange, onAccept }: TermsAcceptanceModalProps) {
  const { currentTerms, isAccepting, acceptTerms } = useTermsOfServiceSimple();
  const [hasRead, setHasRead] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = async () => {
    if (!hasRead || !hasAccepted) return;
    
    const success = await acceptTerms();
    if (success) {
      onAccept();
      onOpenChange(false);
    }
  };

  const openFullTerms = () => {
    window.open('/termos-de-uso', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 w-[95vw] sm:w-full overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <DialogTitle className="text-lg sm:text-xl">
              Aceite dos Termos de Uso
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base">
            Para continuar utilizando o Pipeline Labs, você deve ler e aceitar nossos Termos de Uso.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 flex-1 overflow-y-auto">
          <div className="bg-muted rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{currentTerms?.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Versão {currentTerms?.version} • Vigência: {new Date(currentTerms?.effective_date || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={openFullTerms} className="self-start sm:self-auto">
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ler versão completa</span>
                <span className="sm:hidden">Ver completo</span>
              </Button>
            </div>
          </div>

          {/* Resumo dos principais pontos */}
          <div className="mb-4 sm:mb-6">
            <h4 className="font-semibold mb-3 text-sm sm:text-base">Principais pontos dos Termos de Uso:</h4>
            <ScrollArea className="h-40 sm:h-48 border rounded-lg p-3 sm:p-4">
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <h5 className="font-medium text-primary">✓ Objetivo do Sistema</h5>
                  <p className="text-muted-foreground">
                    ERP completo para gestão empresarial com emissão fiscal, controle de vendas, estoque e financeiro.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-primary">✓ Suas Responsabilidades</h5>
                  <p className="text-muted-foreground">
                    Utilizar apenas para fins legais, manter dados seguros, pagar mensalidades em dia.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-primary">✓ Nossas Responsabilidades</h5>
                  <p className="text-muted-foreground">
                    Manter sistema funcionando (99% disponibilidade), proteger seus dados, fornecer suporte.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-primary">✓ Limitações</h5>
                  <p className="text-muted-foreground">
                    Proibido compartilhar acesso, fazer engenharia reversa ou usar para atividades ilegais.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-primary">✓ Suspensão de Conta</h5>
                  <p className="text-muted-foreground">
                    Pode ocorrer em caso de inadimplência (15+ dias) ou violação dos termos.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-primary">✓ Cancelamento</h5>
                  <p className="text-muted-foreground">
                    Pode cancelar a qualquer momento. Dados ficam disponíveis por 30 dias.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-primary">✓ Privacidade</h5>
                  <p className="text-muted-foreground">
                    Cumprimos integralmente a LGPD. Seus dados são protegidos e não compartilhados.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Checkboxes de confirmação */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="read-terms"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked as boolean)}
                className="mt-0.5"
              />
              <label
                htmlFor="read-terms"
                className="text-xs sm:text-sm leading-5 cursor-pointer flex-1"
              >
                Declaro que li e compreendi os Termos de Uso na íntegra
                <span className="text-destructive ml-1">*</span>
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-terms"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
                disabled={!hasRead}
                className="mt-0.5"
              />
              <label
                htmlFor="accept-terms"
                className="text-xs sm:text-sm leading-5 cursor-pointer flex-1"
              >
                Aceito e concordo em cumprir todos os Termos de Uso do Pipeline Labs
                <span className="text-destructive ml-1">*</span>
              </label>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-amber-800">
              <strong>Importante:</strong> Ao aceitar estes termos, você está concordando com um contrato legal.
              É obrigatório aceitar para continuar usando o sistema. Em caso de dúvidas, entre em contato
              conosco em contato@pipelinelabs.com.br
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 pt-3 sm:pt-0 border-t">
          <Button
            variant="outline"
            onClick={openFullTerms}
            disabled={isAccepting}
            className="w-full sm:w-auto order-2 sm:order-1"
            size="sm"
          >
            <span className="hidden sm:inline">Ler Termos Completos</span>
            <span className="sm:hidden">Ver Termos Completos</span>
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasRead || !hasAccepted || isAccepting}
            className="min-w-[120px] w-full sm:w-auto order-1 sm:order-2"
            size="sm"
          >
            {isAccepting ? "Processando..." : "Aceitar Termos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}