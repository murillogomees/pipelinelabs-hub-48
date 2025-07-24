import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Save, Sparkles } from 'lucide-react';
import { EngineerNote } from '@/hooks/useEngineerNotes';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: EngineerNote | null;
  onSave: (noteData: Omit<EngineerNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onGenerateSummary: (content: string) => Promise<string>;
}

export function NoteDialog({ 
  open, 
  onOpenChange, 
  note, 
  onSave, 
  onGenerateSummary 
}: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setNotes(note.notes);
      setTag(note.tag || '');
    } else {
      setTitle('');
      setNotes('');
      setTag('');
    }
  }, [note, open]);

  const handleSave = async () => {
    if (!title.trim() || !notes.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        notes: notes.trim(),
        tag: tag.trim() || undefined
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!notes.trim()) return;

    try {
      setIsGeneratingSummary(true);
      const summary = await onGenerateSummary(notes);
      setNotes(prevNotes => `${prevNotes}\n\n## Resumo Técnico (GPT-4)\n\n${summary}`);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {note ? 'Editar Visão Técnica' : 'Nova Visão Técnica'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da visão técnica..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tag">Tag (opcional)</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex: arquitetura, performance, segurança..."
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="notes">Conteúdo</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={!notes.trim() || isGeneratingSummary}
                className="text-sm"
              >
                {isGeneratingSummary ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Gerar Resumo GPT
              </Button>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva sua visão técnica sobre a aplicação..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!title.trim() || !notes.trim() || isSaving}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}