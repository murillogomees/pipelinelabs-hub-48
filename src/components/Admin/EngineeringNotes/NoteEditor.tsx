import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, X, Sparkles } from 'lucide-react';
import { EngineeringNote } from '@/hooks/useEngineeringNotes';

interface NoteEditorProps {
  note?: EngineeringNote | null;
  onSave: (noteData: { title: string; notes: string; tag?: string }) => Promise<void>;
  onCancel: () => void;
  onGenerateSummaries?: (content: string) => void;
}

export function NoteEditor({ note, onSave, onCancel, onGenerateSummaries }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.notes);
      setTag(note.tag || '');
    } else {
      setTitle('');
      setContent('');
      setTag('');
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        notes: content.trim(),
        tag: tag.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummaries = () => {
    if (content.trim() && onGenerateSummaries) {
      onGenerateSummaries(content.trim());
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {note ? 'Editar Visão Técnica' : 'Nova Visão Técnica'}
          <div className="flex gap-2">
            {content.trim() && onGenerateSummaries && (
              <Button
                onClick={handleGenerateSummaries}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Comparar Resumos por Tom
              </Button>
            )}
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Nota</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título da visão técnica..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tag">Tag ou Categoria</Label>
          <Input
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="ex: arquitetura, refatoração, estratégia..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Texto em Linguagem Natural</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Descreva sua visão técnica, ideias arquiteturais, estratégias de código..."
            className="min-h-[300px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}