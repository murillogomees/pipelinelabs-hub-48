import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Copy, Trash2, Eye, Search } from 'lucide-react';
import { EngineeringNote } from '@/hooks/useEngineeringNotes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotesGridProps {
  notes: EngineeringNote[];
  onEdit: (note: EngineeringNote) => void;
  onDuplicate: (note: EngineeringNote) => void;
  onDelete: (note: EngineeringNote) => void;
  onView: (note: EngineeringNote) => void;
}

export function NotesGrid({ notes, onEdit, onDuplicate, onDelete, onView }: NotesGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !tagFilter || note.tag?.toLowerCase().includes(tagFilter.toLowerCase());
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(notes.map(note => note.tag).filter(Boolean)));

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Nenhuma visão técnica encontrada</p>
            <p className="text-sm">Crie sua primeira nota para começar!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="sm:w-64">
          <Input
            placeholder="Filtrar por tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Tags disponíveis */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => setTagFilter(tag!)}
            >
              {tag}
            </Badge>
          ))}
          {tagFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTagFilter('')}
              className="h-6 px-2 text-xs"
            >
              Limpar filtro
            </Button>
          )}
        </div>
      )}

      {/* Grid de notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
                  {note.title}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    onClick={() => onView(note)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onEdit(note)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDuplicate(note)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(note)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {note.tag && (
                <Badge variant="secondary" className="w-fit">
                  {note.tag}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {note.notes}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(note.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && notes.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma nota encontrada com os filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}