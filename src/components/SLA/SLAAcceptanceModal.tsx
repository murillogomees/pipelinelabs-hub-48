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
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Acordo de Nível de Serviço (SLA)</DialogTitle>
          <DialogDescription>
            Versão {currentSLA.version} - Vigente desde {new Date(currentSLA.effective_date).toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentSLA.content || 'Conteúdo do SLA em carregamento...' }}
          />
        </ScrollArea>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="sla-read" 
            checked={hasRead}
            onCheckedChange={(checked) => setHasRead(checked === true)}
          />
          <label 
            htmlFor="sla-read" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Li e concordo com os termos do Acordo de Nível de Serviço
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!hasRead || isAccepting}
          >
            {isAccepting ? 'Aceitando...' : 'Aceitar SLA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}