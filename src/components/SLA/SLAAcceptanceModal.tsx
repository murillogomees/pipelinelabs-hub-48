import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useSLA } from '@/hooks/useSLA';

interface SLAAcceptanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SLAAcceptanceModal({ open, onOpenChange }: SLAAcceptanceModalProps) {
  const [hasRead, setHasRead] = useState(false);
  const { currentSLA, acceptSLA, isAccepting } = useSLA();

  const handleAccept = () => {
    if (currentSLA?.id) {
      acceptSLA(currentSLA.id);
      onOpenChange(false);
    }
  };

  if (!currentSLA) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[80vh] w-[95vw] sm:w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl">Acordo de Nível de Serviço (SLA)</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Versão {currentSLA.version} - Vigente desde {new Date(currentSLA.effective_date).toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-4 sm:px-6 flex-1 overflow-y-auto">
          <ScrollArea className="h-80 sm:h-96 w-full rounded-md border p-3 sm:p-4 mb-4">
            <div 
              className="prose prose-sm max-w-none text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ __html: currentSLA.content || 'Conteúdo do SLA em carregamento...' }}
            />
          </ScrollArea>

          <div className="flex items-start space-x-3 mb-4">
            <Checkbox 
              id="sla-read" 
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked === true)}
              className="mt-0.5"
            />
            <label 
              htmlFor="sla-read" 
              className="text-xs sm:text-sm font-medium leading-5 cursor-pointer flex-1"
            >
              Li e concordo com os termos do Acordo de Nível de Serviço
              <span className="text-destructive ml-1">*</span>
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 p-4 sm:p-6 pt-3 sm:pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
            size="sm"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!hasRead || isAccepting}
            className="w-full sm:w-auto order-1 sm:order-2 min-w-[120px]"
            size="sm"
          >
            {isAccepting ? 'Aceitando...' : 'Aceitar SLA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}