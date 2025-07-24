import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Copy, Sparkles } from 'lucide-react';
import { EngineeringNote } from '@/hooks/useEngineeringNotes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReadingModeProps {
  note: EngineeringNote;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onGenerateSummaries: () => void;
}

export function ReadingMode({ note, onClose, onEdit, onDuplicate, onGenerateSummaries }: ReadingModeProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{note.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Criado {formatDistanceToNow(new Date(note.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                {note.tag && <Badge variant="secondary">{note.tag}</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onGenerateSummaries}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Resumos por Tom
              </Button>
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                onClick={onDuplicate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-8">
          <div className="prose prose-gray max-w-none">
            <div className="whitespace-pre-wrap font-medium leading-relaxed text-base">
              {note.notes}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}