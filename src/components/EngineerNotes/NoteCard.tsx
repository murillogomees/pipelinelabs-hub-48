import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  FileDown,
  Sparkles 
} from 'lucide-react';
import { EngineerNote } from '@/hooks/useEngineerNotes';

interface NoteCardProps {
  note: EngineerNote;
  onEdit: (note: EngineerNote) => void;
  onDuplicate: (note: EngineerNote) => void;
  onDelete: (id: string) => void;
  onView: (note: EngineerNote) => void;
  onExport: (note: EngineerNote) => void;
  onGenerateSummary: (note: EngineerNote) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onExport,
  onGenerateSummary
}: NoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreview = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {note.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {note.tag && (
                <Badge variant="secondary" className="text-xs">
                  {note.tag}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(note.created_at)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(note)}>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(note)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(note)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateSummary(note)}>
                <Sparkles className="w-4 h-4 mr-2" />
                Resumo GPT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(note)}>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(note.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getPreview(note.notes)}
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(note)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(note)}
            className="text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}