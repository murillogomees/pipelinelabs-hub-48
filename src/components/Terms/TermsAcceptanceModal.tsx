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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">
              Aceite dos Termos de Uso
            </DialogTitle>
          </div>
          <DialogDescription>
            Para continuar utilizando o Pipeline Labs, você deve ler e aceitar nossos Termos de Uso.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentTerms?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Versão {currentTerms?.version} • Vigência: {new Date(currentTerms?.effective_date || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={openFullTerms}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ler versão completa
              </Button>
            </div>
          </div>

          {/* Resumo dos principais pontos */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Principais pontos dos Termos de Uso:</h4>
            <ScrollArea className="h-48 border rounded-lg p-4">
              <div className="space-y-3 text-sm">
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
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="read-terms"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked as boolean)}
              />
              <label
                htmlFor="read-terms"
                className="text-sm leading-5 cursor-pointer"
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
              />
              <label
                htmlFor="accept-terms"
                className="text-sm leading-5 cursor-pointer"
              >
                Aceito e concordo em cumprir todos os Termos de Uso do Pipeline Labs
                <span className="text-destructive ml-1">*</span>
              </label>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Importante:</strong> Ao aceitar estes termos, você está concordando com um contrato legal.
              É obrigatório aceitar para continuar usando o sistema. Em caso de dúvidas, entre em contato
              conosco em juridico@pipelinelabs.app
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 p-6 pt-0 border-t">
          <Button
            variant="outline"
            onClick={openFullTerms}
            disabled={isAccepting}
          >
            Ler Termos Completos
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasRead || !hasAccepted || isAccepting}
            className="min-w-[120px]"
          >
            {isAccepting ? "Processando..." : "Aceitar Termos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}