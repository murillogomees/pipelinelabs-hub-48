import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { EngineerNote } from '@/hooks/useEngineerNotes';

interface ReadingModeProps {
  note: EngineerNote | null;
  open: boolean;
  onClose: () => void;
}

export function ReadingMode({ note, open, onClose }: ReadingModeProps) {
  if (!note) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        {/* Header fixo */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {note.title}
            </h1>
            <div className="flex items-center gap-3">
              {note.tag && (
                <Badge variant="secondary" className="text-sm">
                  {note.tag}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Criado em {formatDate(note.created_at)}
              </span>
              {note.updated_at !== note.created_at && (
                <span className="text-sm text-muted-foreground">
                  • Atualizado em {formatDate(note.updated_at)}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-4"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="p-8 pt-0">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed font-mono text-sm">
                {note.notes}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}